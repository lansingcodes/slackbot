// Opt-in service check: stage one event, run the real scheduler twice, and
// confirm it announces only once in the configured test Slack channel.
const assert = require('node:assert/strict')
const { createHash, randomUUID } = require('node:crypto')
const { initializeApp, getApps, deleteApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getApps: getClientApps, deleteApp: deleteClientApp } = require('firebase/app')
const { getFirestore: getClientFirestore, terminate } = require('firebase/firestore')

const projectId = 'lansing-codes-test-staging'
const teamId = 'T0CCAQ20G0P'

async function slackApi (method, body) {
  const inspect = method === 'conversations.info'
  const url = new URL(`https://slack.com/api/${method}`)
  if (inspect) url.searchParams.set('channel', body.channel)
  const response = await fetch(url, {
    method: inspect ? 'GET' : 'POST',
    headers: {
      authorization: `Bearer ${process.env.HUBOT_SLACK_BOT_TOKEN}`,
      'content-type': 'application/json; charset=utf-8'
    },
    body: inspect ? undefined : JSON.stringify(body || {}),
    signal: AbortSignal.timeout(15000)
  })
  if (!response.ok) throw new Error(`Slack ${method} returned HTTP ${response.status}`)
  return response.json()
}

async function main () {
  const refreshment = process.argv[2]
  assert([undefined, '--cupcake', '--latte', '--pumpkin'].includes(refreshment), 'Use --cupcake, --latte, or --pumpkin')
  if (refreshment === '--pumpkin') {
    assert([8, 9, 10].includes(new Date().getUTCMonth()), 'Pumpkin spice latte is available September-November')
  }
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, undefined, 'Use cloud Firestore')
  assert.notEqual(process.env.NOTIFICATION_STORE, 'memory', 'Use persistent notifications')
  const webConfig = JSON.parse(process.env.FIREBASE_WEB_CONFIG || '{}')
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  assert.equal(webConfig.projectId, projectId, 'Wrong Firebase web project')
  assert.equal(serviceAccount.project_id, projectId, 'Wrong Firebase Admin project')
  assert(process.env.HUBOT_SLACK_BOT_TOKEN?.startsWith('xoxb-'), 'Missing test bot token')
  const channel = process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID
  assert(channel?.startsWith('C'), 'Set the test announcement channel ID')
  const auth = await slackApi('auth.test')
  assert.equal(auth.team_id, teamId, 'Wrong Slack workspace')
  const info = await slackApi('conversations.info', { channel })
  assert.equal(info.ok, true, `Cannot inspect test channel: ${info.error || 'unknown error'}`)
  assert(['upcoming-events', 'events'].includes(info.channel?.name), 'Use a dedicated test events channel')

  const id = `live-channel-smoke-${randomUUID()}`
  const url = `https://example.org/lansing-codes-channel-test/${id}`
  const event = {
    name: `Lansing Codes test: event channel routing (${id})`,
    url,
    group: 'channel-smoke',
    startTime: Date.now() + 3 * 24 * 60 * 60 * 1000
  }
  const app = initializeApp({ projectId, credential: cert(serviceAccount) }, 'channel-smoke')
  const db = getFirestore(app)
  const eventRef = db.collection('events').doc(id)
  const notificationRef = db.collection('slackbot_notifications')
    .doc(createHash('sha256').update(id).digest('hex'))
  const posted = []
  const errors = []
  const robot = {
    adapter: {
      client: {
        web: {
          chat: {
            postMessage: async body => {
              const result = await slackApi('chat.postMessage', body)
              posted.push({ channel: body.channel, text: body.text, ts: result.ts })
              return result
            }
          }
        }
      }
    },
    logger: { error: message => errors.push(message), warn: message => errors.push(message) }
  }

  try {
    await eventRef.create(event)
    const run = require('../lib/scheduled-tasks/check-for-upcoming-events')
    const runWithRefreshment = async () => {
      const previousRandom = Math.random
      if (refreshment) {
        const picks = refreshment === '--cupcake'
          ? [0.75, 0.99, 0.5]
          : refreshment === '--pumpkin' ? [0.25, 0.999, 0] : [0.25, 0.12, 0]
        let index = 0
        Math.random = () => picks[Math.min(index++, picks.length - 1)]
      }
      try {
        const result = run(robot)
        Math.random = previousRandom
        await result
      } finally {
        Math.random = previousRandom
      }
    }
    await runWithRefreshment()
    await runWithRefreshment()
    assert.deepEqual(errors, [], 'Scheduler reported an error')
    const eventPosts = posted.filter(message => message.text.includes(url))
    assert.equal(eventPosts.length, 1, 'Event must be announced exactly once')
    assert.equal(eventPosts[0].channel, channel, 'Event must use the dedicated channel')
    const claim = await notificationRef.get()
    assert.equal(claim.get('status'), 'delivered')
    assert.equal(claim.get('key'), id)
    if (refreshment) {
      const name = refreshment === '--cupcake'
        ? 'cupcake'
        : refreshment === '--pumpkin' ? 'pumpkin spice latte' : 'latte'
      const mornings = posted.filter(message => message.text.startsWith('Good morning everyone!'))
      const noEvents = posted.filter(message => message.text.startsWith("I didn't find any new meetups."))
      assert.equal(mornings.length, 2)
      assert.equal(noEvents.length, 1)
      assert(mornings.every(message => message.text.includes(`grab a ${name}`)))
      assert(noEvents[0].text.includes(name))
      if (name === 'cupcake') assert(!/drink|drank|sip|taste/i.test(noEvents[0].text))
    }
    console.log(`PASS: event announced once in #${info.channel.name} at ${eventPosts[0].ts}; second scheduler run did not repeat it`)
  } finally {
    await Promise.all([eventRef.delete(), notificationRef.delete()])
    await Promise.all(getClientApps().map(async app => {
      await terminate(getClientFirestore(app))
      await deleteClientApp(app)
    }))
    await Promise.all(getApps().map(deleteApp))
  }
}

main().catch(error => {
  console.error(`Live event channel smoke failed: ${error.message}`)
  process.exitCode = 1
})

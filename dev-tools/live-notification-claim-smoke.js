// Opt-in check against the personal Lansing Codes test workspace and Firestore project.
// Posts one clearly labeled message to the configured test announcement channel.
const assert = require('node:assert/strict')
const { createHash, randomUUID } = require('node:crypto')
const { getApps, deleteApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const getEventsCacher = require('../lib/cachers/events-cacher')

const projectId = 'lansing-codes-test-staging'
const teamId = 'T0CCAQ20G0P'

async function slackApi (method, body) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.HUBOT_SLACK_BOT_TOKEN}`,
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body || {}),
    signal: AbortSignal.timeout(15000)
  })
  if (!response.ok) throw new Error(`Slack ${method} returned HTTP ${response.status}`)
  return response.json()
}

async function main () {
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, undefined, 'Use cloud Firestore')
  assert.notEqual(process.env.NOTIFICATION_STORE, 'memory', 'Use persistent notifications')
  const webConfig = JSON.parse(process.env.FIREBASE_WEB_CONFIG || '{}')
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  assert.equal(webConfig.projectId, projectId, 'Wrong Firebase web project')
  assert.equal(serviceAccount.project_id, projectId, 'Wrong Firebase Admin project')
  assert(process.env.HUBOT_SLACK_BOT_TOKEN?.startsWith('xoxb-'), 'Missing test bot token')
  const channel = process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID
  assert(channel, 'Missing test announcement channel')
  const auth = await slackApi('auth.test')
  assert.equal(auth.team_id, teamId, 'Wrong Slack workspace')

  const key = `live-claim-smoke:${randomUUID()}`
  const event = { id: key }
  const text = `Lansing Codes test: PR #100 concurrent delivery check (${key}). One message expected.`
  const cacherA = await getEventsCacher({ logger: console }).load()
  const cacherB = await getEventsCacher({ logger: console }).load()
  let signalStarted
  let resumeFirst
  const started = new Promise(resolve => { signalStarted = resolve })
  const paused = new Promise(resolve => { resumeFirst = resolve })
  let postedAt
  try {
    const first = cacherA.deliverOnce(event, async () => {
      signalStarted()
      await paused
      const posted = await slackApi('chat.postMessage', {
        channel,
        text,
        unfurl_links: false,
        unfurl_media: false
      })
      assert.equal(posted.ok, true, `Slack rejected test post: ${posted.error || 'unknown error'}`)
      postedAt = posted.ts
    })
    await started
    let secondPosted = false
    const second = await cacherB.deliverOnce(event, async () => { secondPosted = true })
    assert.equal(second, false)
    assert.equal(secondPosted, false)
    resumeFirst()
    assert.equal(await first, true)
    const cacherAfterRestart = await getEventsCacher({ logger: console }).load()
    assert.equal(await cacherAfterRestart.deliverOnce(event, async () => { throw new Error('Restart repeated notification') }), false)
    const app = getApps().find(item => item.name === 'slackbot-notifications')
    const doc = await getFirestore(app).collection('slackbot_notifications')
      .doc(createHash('sha256').update(key).digest('hex')).get()
    assert.equal(doc.get('status'), 'delivered')
    assert.equal(doc.get('key'), key)
    console.log(`PASS: live Slack accepted one test post in channel ${channel} at ${postedAt}; cloud Firestore blocked overlap and restart`)
  } finally {
    resumeFirst()
    await Promise.all(getApps().map(deleteApp))
  }
}

main().catch(error => {
  console.error(`Live claim smoke failed: ${error.message}`)
  process.exitCode = 1
})

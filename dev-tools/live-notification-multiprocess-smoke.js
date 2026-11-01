// Opt-in test: two separate Node processes claim one notification in the
// personal Slack workspace and staging Firestore project.
const assert = require('node:assert/strict')
const { createHash, randomUUID } = require('node:crypto')
const { fork } = require('node:child_process')
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

async function validateTarget () {
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, undefined, 'Use cloud Firestore')
  assert.notEqual(process.env.NOTIFICATION_STORE, 'memory', 'Use persistent notifications')
  const webConfig = JSON.parse(process.env.FIREBASE_WEB_CONFIG || '{}')
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  assert.equal(webConfig.projectId, projectId, 'Wrong Firebase web project')
  assert.equal(serviceAccount.project_id, projectId, 'Wrong Firebase Admin project')
  assert(process.env.HUBOT_SLACK_BOT_TOKEN?.startsWith('xoxb-'), 'Missing test bot token')
  assert(process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID, 'Missing test announcement channel')
  const auth = await slackApi('auth.test')
  assert.equal(auth.team_id, teamId, 'Wrong Slack workspace')
}

async function worker (role, key, text) {
  assert(['first', 'second'].includes(role), 'Unknown worker role')
  await validateTarget()
  const cacher = await getEventsCacher({ logger: console }).load()
  const delivered = await cacher.deliverOnce({ id: key }, async () => {
    if (role === 'first') {
      process.send({ type: 'claim-held' })
      await new Promise(resolve => process.once('message', message => {
        if (message.type === 'release') resolve()
      }))
    }
    const posted = await slackApi('chat.postMessage', {
      channel: process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID,
      text,
      unfurl_links: false,
      unfurl_media: false
    })
    assert.equal(posted.ok, true, `Slack rejected test post: ${posted.error || 'unknown error'}`)
    process.send({ type: 'posted', ts: posted.ts })
  })
  process.send({ type: 'done', delivered })
  await Promise.all(getApps().map(deleteApp))
}

function startWorker (role, key, text) {
  const child = fork(__filename, [role, key, text], {
    stdio: ['ignore', 'inherit', 'inherit', 'ipc']
  })
  const messages = []
  const waiters = []
  child.on('message', message => {
    messages.push(message)
    for (const waiter of waiters.splice(0)) waiter()
  })
  const exited = new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`${role} worker exited ${code || signal}`))
      for (const waiter of waiters.splice(0)) waiter()
    })
    child.on('error', reject)
  })
  exited.catch(() => {})
  const next = type => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${role} timed out waiting for ${type}`)), 30000)
    const check = () => {
      const found = messages.find(message => message.type === type)
      if (found) {
        clearTimeout(timeout)
        resolve(found)
      } else if (child.exitCode !== null) {
        clearTimeout(timeout)
        reject(new Error(`${role} exited before ${type}`))
      } else waiters.push(check)
    }
    check()
  })
  return { child, messages, next, exited }
}

async function main () {
  await validateTarget()
  const key = `live-multiprocess-smoke:${randomUUID()}`
  const text = `Lansing Codes test: PR #100 two-process claim check (${key}). One message expected.`
  let first
  let second
  try {
    first = startWorker('first', key, text)
    await first.next('claim-held')
    second = startWorker('second', key, text)
    const secondDone = await second.next('done')
    assert.equal(secondDone.delivered, false, 'Second process must not claim notification')
    assert.equal(second.messages.some(message => message.type === 'posted'), false)
    first.child.send({ type: 'release' })
    const firstDone = await first.next('done')
    assert.equal(firstDone.delivered, true)
    await Promise.all([first.exited, second.exited])
    const posts = [...first.messages, ...second.messages].filter(message => message.type === 'posted')
    assert.equal(posts.length, 1, 'Exactly one Slack test post expected')

    const cacher = await getEventsCacher({ logger: console }).load()
    assert.equal(await cacher.deliverOnce({ id: key }, async () => {
      throw new Error('Restart repeated notification')
    }), false)
    const app = getApps().find(item => item.name === 'slackbot-notifications')
    const doc = await getFirestore(app).collection('slackbot_notifications')
      .doc(createHash('sha256').update(key).digest('hex')).get()
    assert.equal(doc.get('status'), 'delivered')
    assert.equal(doc.get('key'), key)
    console.log(`PASS: two Node processes, one Slack post at ${posts[0].ts}, delivered Firestore claim, no restart repeat`)
  } finally {
    if (first && first.child.exitCode === null) first.child.kill()
    if (second && second.child.exitCode === null) second.child.kill()
    await Promise.all(getApps().map(deleteApp))
  }
}

if (process.argv[2]) {
  worker(process.argv[2], process.argv[3], process.argv[4]).catch(error => {
    console.error(`Worker failed: ${error.message}`)
    process.exitCode = 1
  })
} else {
  main().catch(error => {
    console.error(`Live multiprocess claim smoke failed: ${error.message}`)
    process.exitCode = 1
  })
}

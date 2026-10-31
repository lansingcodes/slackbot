const assert = require('node:assert/strict')
const { spawn, spawnSync } = require('node:child_process')
const { initializeApp, deleteApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const getEventsCacher = require('../lib/cachers/events-cacher')
const { SlackPostRejectedError } = require('../lib/helpers/post-room-message')

const host = process.env.FIRESTORE_EMULATOR_HOST
assert.match(host || '', /^(127\.0\.0\.1|localhost):8085$/, 'Run against the local Firestore emulator on port 8085')

const projectId = 'demo-lansingcodes'
const eventId = 'notification-restart-smoke'
const eventUrl = 'https://example.test/notification-restart-smoke'
process.env.FIREBASE_WEB_CONFIG = JSON.stringify({ apiKey: 'local-only', appId: 'local-only', projectId })
process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID = 'CLOCAL'
process.env.EVENT_GROUP_CHANNEL_IDS = JSON.stringify({ smoketest: 'CGROUP' })
delete process.env.NOTIFICATION_STORE

async function worker () {
  const messages = []
  const errors = []
  const robot = {
    adapter: {
      client: {
        web: {
          chat: {
            postMessage: async message => {
              messages.push(message)
              return { ok: true }
            }
          }
        }
      }
    },
    logger: { error: message => errors.push(message) },
    messageRoom: () => { throw new Error('Unexpected adapter fallback') }
  }
  await require('../lib/scheduled-tasks/check-for-upcoming-events')(robot)
  assert.deepEqual(errors, [])
  process.stdout.write(`${JSON.stringify(messages)}\n`)
}

function runWorker () {
  const result = spawnSync(process.execPath, [__filename, '--worker'], {
    env: process.env,
    encoding: 'utf8',
    timeout: 30000
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  return JSON.parse(result.stdout.trim())
}

function runWorkerAsync () {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [__filename, '--worker'], { env: process.env })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => {
      if (code !== 0) reject(new Error(stderr || stdout))
      else resolve(JSON.parse(stdout.trim()))
    })
  })
}

async function main () {
  const app = initializeApp({ projectId }, 'notification-restart-smoke')
  const db = getFirestore(app)
  try {
    const start = new Date()
    start.setDate(start.getDate() + 7)
    start.setHours(18, 0, 0, 0)
    await db.doc(`events/${eventId}`).set({
      group: 'smoketest',
      name: 'Restart smoke event',
      url: eventUrl,
      startTime: start.valueOf()
    })

    const first = runWorker()
    const second = runWorker()
    const matches = messages => messages.filter(message => message.text.includes(eventUrl))
    assert.equal(matches(first).length, 2, 'First process should announce the new event and week reminder')
    assert.equal(matches(second).length, 0, 'Restarted process must not repeat either announcement')
    assert.deepEqual(new Set(matches(first).map(message => message.channel)), new Set(['CLOCAL', 'CGROUP']))
    const snapshot = await db.collection('slackbot_notifications').get()
    const keys = snapshot.docs.map(doc => doc.data().key)
    assert(keys.includes(eventId))
    assert(keys.includes(`local-week:${eventId}`))
    console.log('Notification restart smoke passed: two initial deliveries, zero repeats, two persisted keys')

    const concurrentId = 'notification-concurrent-smoke'
    const concurrentUrl = 'https://example.test/notification-concurrent-smoke'
    await db.doc(`events/${concurrentId}`).set({
      group: 'smoketest', name: 'Concurrent smoke event', url: concurrentUrl, startTime: start.valueOf()
    })
    const simultaneous = await Promise.all([runWorkerAsync(), runWorkerAsync()])
    const concurrentPosts = simultaneous.flat().filter(message => message.text.includes(concurrentUrl))
    assert.equal(concurrentPosts.length, 2, 'Two bot processes should send each event message only once')
    assert.deepEqual(new Set(concurrentPosts.map(message => message.channel)), new Set(['CLOCAL', 'CGROUP']))
    console.log('Notification concurrency smoke passed: two processes, one announcement per channel')

    const warnings = []
    const cacheRobot = { logger: { warn: message => warnings.push(message), error: () => {} } }
    const firstCacher = await getEventsCacher(cacheRobot).load()
    const secondCacher = await getEventsCacher(cacheRobot).load()
    const controlled = { id: 'notification-controlled-concurrency-smoke' }
    let signalFirstStarted
    let releaseFirst
    const firstStarted = new Promise(resolve => { signalFirstStarted = resolve })
    const firstPaused = new Promise(resolve => { releaseFirst = resolve })
    const firstDelivery = firstCacher.deliverOnce(controlled, async () => {
      signalFirstStarted()
      await firstPaused
    })
    await firstStarted
    let secondSent = false
    assert.equal(await secondCacher.deliverOnce(controlled, async () => { secondSent = true }), false)
    assert.equal(secondSent, false)
    releaseFirst()
    assert.equal(await firstDelivery, true)
    console.log('Notification claim smoke passed: a held first send blocks a simultaneous second send')

    const cacher = await getEventsCacher(cacheRobot).load()
    const uncertain = { id: 'notification-uncertain-smoke' }
    await assert.rejects(cacher.deliverOnce(uncertain, async () => {
      throw new Error('Simulated network timeout after possible Slack delivery')
    }), /Simulated network timeout/)
    const uncertainDoc = await db.collection('slackbot_notifications')
      .where('key', '==', uncertain.id).get()
    assert.equal(uncertainDoc.docs[0].data().status, 'uncertain')
    let repeated = false
    assert.equal(await cacher.deliverOnce(uncertain, async () => { repeated = true }), false)
    assert.equal(repeated, false)
    assert(warnings.some(message => message.includes(uncertain.id)))

    const rejected = { id: 'notification-rejected-smoke' }
    await assert.rejects(cacher.deliverOnce(rejected, async () => {
      throw new SlackPostRejectedError('Slack explicitly rejected the message')
    }), /explicitly rejected/)
    assert.equal(await cacher.deliverOnce(rejected, async () => {}), true)
    console.log('Notification failure smoke passed: uncertain sends require review; definite rejections can retry')
  } finally {
    await deleteApp(app)
  }
}

;(process.argv.includes('--worker') ? worker().then(() => process.exit(0)) : main()).catch(error => {
  console.error(error)
  process.exitCode = 1
})

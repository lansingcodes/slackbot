const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { initializeApp, deleteApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

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

async function main () {
  const app = initializeApp({ projectId }, 'notification-restart-smoke')
  try {
    const start = new Date()
    start.setDate(start.getDate() + 7)
    start.setHours(18, 0, 0, 0)
    await getFirestore(app).doc(`events/${eventId}`).set({
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
    const snapshot = await getFirestore(app).collection('slackbot_notifications').get()
    const keys = snapshot.docs.map(doc => doc.data().key)
    assert(keys.includes(eventId))
    assert(keys.includes(`local-week:${eventId}`))
    console.log('Notification restart smoke passed: two initial deliveries, zero repeats, two persisted keys')
  } finally {
    await deleteApp(app)
  }
}

;(process.argv.includes('--worker') ? worker().then(() => process.exit(0)) : main()).catch(error => {
  console.error(error)
  process.exitCode = 1
})

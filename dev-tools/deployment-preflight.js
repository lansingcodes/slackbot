// Check the exact services a deployment will use without posting to Slack.
const { createHash, randomUUID } = require('node:crypto')
const { getApps, deleteApp } = require('firebase-admin/app')
const { getApps: getClientApps, deleteApp: deleteClientApp } = require('firebase/app')
const getEventsFetcher = require('../lib/fetchers/events-fetcher')
const getEventsCacher = require('../lib/cachers/events-cacher')
const parseJsonConfig = require('../lib/helpers/parse-json-config')

function options (args) {
  const result = { writeCheck: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--expect-project') result.project = args[++i]
    else if (args[i] === '--expect-team') result.team = args[++i]
    else if (args[i] === '--write-check') result.writeCheck = true
    else throw new Error(`Unknown option: ${args[i]}`)
  }
  if (!result.project) throw new Error('--expect-project is required')
  if (!result.team) throw new Error('--expect-team is required')
  return result
}

function checkConfiguration (expected) {
  if (process.env.NOTIFICATION_STORE === 'memory') throw new Error('NOTIFICATION_STORE=memory cannot verify deployment persistence')
  if (process.env.FIRESTORE_EMULATOR_HOST) throw new Error('FIRESTORE_EMULATOR_HOST cannot verify the named cloud project')
  if (!process.env.HUBOT_SLACK_APP_TOKEN || !process.env.HUBOT_SLACK_BOT_TOKEN) throw new Error('Both Slack tokens are required')
  if (!process.env.FIREBASE_WEB_CONFIG) throw new Error('FIREBASE_WEB_CONFIG is required')

  const web = parseJsonConfig('FIREBASE_WEB_CONFIG', process.env.FIREBASE_WEB_CONFIG)
  if (web.projectId !== expected.project) throw new Error('FIREBASE_WEB_CONFIG.projectId does not match --expect-project')
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== expected.project) {
    throw new Error('FIREBASE_PROJECT_ID does not match --expect-project')
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = parseJsonConfig('FIREBASE_SERVICE_ACCOUNT', process.env.FIREBASE_SERVICE_ACCOUNT)
    if (serviceAccount.project_id !== expected.project) throw new Error('FIREBASE_SERVICE_ACCOUNT.project_id does not match --expect-project')
  }
}

async function checkSlack (expectedTeam) {
  const response = await fetch('https://slack.com/api/auth.test', {
    headers: { authorization: `Bearer ${process.env.HUBOT_SLACK_BOT_TOKEN}` },
    signal: AbortSignal.timeout(10000)
  })
  if (!response.ok) throw new Error(`Slack auth.test returned HTTP ${response.status}`)
  const result = await response.json()
  if (!result.ok) throw new Error(`Slack auth.test failed: ${result.error}`)
  if (result.team_id !== expectedTeam) throw new Error('Slack bot token belongs to a different workspace')
  return result.team
}

async function checkNotificationWrite () {
  const key = `preflight:${randomUUID()}`
  const docId = createHash('sha256').update(key).digest('hex')
  const cacher = getEventsCacher({})
  const app = () => getApps().find(item => item.name === 'slackbot-notifications')
  let doc
  try {
    await cacher.load()
    const { getFirestore } = require('firebase-admin/firestore')
    doc = getFirestore(app()).collection('slackbot_notifications').doc(docId)
    await cacher.cache({ id: key })
    const saved = await doc.get()
    if (!saved.exists || saved.data().key !== key) throw new Error('Notification write/read verification failed')
  } finally {
    if (doc) await doc.delete()
  }
}

async function main (args) {
  const expected = options(args)
  checkConfiguration(expected)
  try {
    const team = await checkSlack(expected.team)
    const events = await (await getEventsFetcher({})).upcoming()
    const cacher = await getEventsCacher({}).load()
    if (expected.writeCheck) await checkNotificationWrite()
    console.log(`Preflight passed: Slack workspace ${team}; Firebase project ${expected.project}; ${events.length} upcoming events; ${Object.keys(cacher.getAll()).length} notification keys; write check ${expected.writeCheck ? 'passed' : 'skipped'}.`)
  } finally {
    await Promise.all([
      ...getClientApps().map(deleteClientApp),
      ...getApps().map(deleteApp)
    ])
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(error => {
    console.error(`Preflight failed: ${error.message}`)
    process.exitCode = 1
  })
}

module.exports = { options, checkConfiguration, main }

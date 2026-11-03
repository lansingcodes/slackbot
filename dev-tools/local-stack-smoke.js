const assert = require('node:assert/strict')
const path = require('node:path')
const { createRequire } = require('node:module')
const { Robot, Adapter, TextMessage, EnterMessage } = require('hubot')
const proxyquire = require('proxyquire').noCallThru()
const websiteRequire = createRequire(process.env.STACK_WEBSITE_PACKAGE || path.resolve(__dirname, '../../website/package.json'))
const { initializeApp, deleteApp } = websiteRequire('firebase-admin/app')
const { getFirestore } = websiteRequire('firebase-admin/firestore')
const { terminate } = require('firebase/firestore')

const projectId = 'demo-lansingcodes'
const host = process.env.FIRESTORE_EMULATOR_HOST
if (host !== '127.0.0.1:8085' && host !== 'localhost:8085') {
  throw new Error('The smoke test only writes to the local Firestore emulator on port 8085')
}

process.env.FIREBASE_WEB_CONFIG = JSON.stringify({
  apiKey: 'local-test-only',
  appId: 'local-test-only',
  projectId
})
process.env.WELCOMER_BY_CHANNEL = JSON.stringify({ CGENERAL: 'UWELCOME' })
process.env.APPROVED_TWEETER_IDS = 'UAPPROVED'
process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID = 'CGENERAL'
process.env.EVENT_GROUP_CHANNEL_IDS = JSON.stringify({ smoketest: 'CDEVOPS' })

const startTime = Date.now() + 3 * 24 * 60 * 60 * 1000
const eventName = 'Local stack smoke event'
const eventUrl = 'https://example.test/local-stack-smoke'

class LocalAdapter extends Adapter {
  async send (envelope, ...strings) { this.emit('send', envelope, strings.map(value => typeof value === 'string' ? value : value.text)) }
  async reply (envelope, ...strings) { this.emit('reply', envelope, strings) }
  async run () { this.emit('connected') }
}

function waitForSend (adapter, predicate, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      adapter.off('send', onSend)
      reject(new Error('Timed out waiting for a matching bot message'))
    }, timeoutMs)
    const onSend = (envelope, strings) => {
      if (!predicate(envelope, strings)) return
      clearTimeout(timer)
      adapter.off('send', onSend)
      resolve({ envelope, text: strings.join(' ') })
    }
    adapter.on('send', onSend)
  })
}

async function sendText (robot, user, text, predicate, id = '1234567890.000001') {
  const sent = waitForSend(robot.adapter, predicate)
  await robot.adapter.receive(new TextMessage(user, text, id))
  return sent
}

async function main () {
  const adminApp = initializeApp({ projectId }, 'local-stack-smoke')
  const eventDoc = getFirestore(adminApp).doc('events/local-stack-smoke')
  await eventDoc.set({ group: 'smoketest', name: eventName, url: eventUrl, startTime })
  const robot = new Robot('local-adapter', false, 'slackbot')
  robot.adapter = new LocalAdapter(robot)
  robot.adapter.self = { url: 'https://example.slack.com/' }
  robot.adapter.client = {
    fetchConversation: async () => ({ name: 'general' }),
    web: {
      conversations: {
        list: async () => ({
          channels: [{ id: 'CDEVOPS', name: 'devops' }],
          response_metadata: { next_cursor: '' }
        })
      }
    }
  }
  let submittedTweet
  const localTweet = (message, onError, onSuccess) => {
    submittedTweet = message
    onSuccess()
  }
  require('../lib/initializers/events-responder')(robot)
  require('../lib/initializers/mentioned-rooms-referencer')(robot)
  require('../lib/initializers/new-participant-notifier')(robot)
  proxyquire('../lib/initializers/tweeter', {
    '../helpers/tweet': localTweet,
    '../helpers/get-denied-gif': () => 'https://example.test/denied.gif'
  })(robot)
  await robot.run()

  try {
    const user = robot.brain.userForId('ULOCAL', { name: 'local', room: 'CGENERAL' })
    const approved = robot.brain.userForId('UAPPROVED', { name: 'approved', room: 'CGENERAL' })

    const upcoming = await sendText(robot, user, 'upcoming events', (room, lines) =>
      room.room === 'CGENERAL' && lines.join(' ').includes(eventName))
    assert.match(upcoming.text, /Upcoming events/)
    console.log('PASS: Firestore event appears in the upcoming events reply')

    const next = await sendText(robot, user, 'next smoketest event', (room, lines) =>
      room.room === 'CGENERAL' && lines.join(' ').includes(eventUrl))
    assert.match(next.text, /Local stack smoke event/)
    console.log('PASS: group-specific reply links to the event')

    const announcement = waitForSend(robot.adapter, (room, lines) =>
      room.room === 'CGENERAL' && lines.join(' ').includes(`new event scheduled: <${eventUrl}|${eventName}>`))
    await require('../lib/scheduled-tasks/check-for-upcoming-events')(robot)
    await announcement
    console.log('PASS: scheduled task announces Firestore events to the configured channel')

    const afterRestart = []
    const restartedRobot = {
      brain: { get: () => undefined, set: () => {} },
      messageRoom: (...args) => afterRestart.push(args),
      logger: { error: error => { throw new Error(error) } }
    }
    await require('../lib/scheduled-tasks/check-for-upcoming-events')(restartedRobot)
    assert.equal(afterRestart.filter(([, text]) => text.includes('new event scheduled:')).length, 0)
    console.log('PASS: a fresh bot does not repeat an announcement after restart')

    const reference = await sendText(robot, user, 'Please ask #devops', (room, lines) =>
      room.room === 'CDEVOPS' && lines.join(' ').includes('/archives/CGENERAL/p1234567890000001'))
    assert.match(reference.text, /This channel was just referenced/)
    console.log('PASS: a channel mention notifies the referenced channel')

    const joined = robot.brain.userForId('UNEW', { name: 'newcomer', room: 'CGENERAL' })
    const joinNotice = waitForSend(robot.adapter, (room, lines) =>
      room.room === 'UWELCOME' && lines.join(' ').includes('newcomer just joined general'))
    await robot.adapter.receive(new EnterMessage(joined))
    await joinNotice
    console.log('PASS: a join event notifies the configured welcomer')

    const denied = await sendText(robot, user, 'slackbot tweet blocked', (room, lines) =>
      room.room === 'CGENERAL' && lines.join(' ').includes('No tweet for you!'))
    assert.match(denied.text, /Only the following users have access/)
    assert.equal(submittedTweet, undefined)
    console.log('PASS: an unapproved user cannot post a tweet')

    const tweet = await sendText(robot, approved, 'slackbot tweet local test', (room, lines) =>
      room.room === 'CGENERAL' && lines.join(' ').includes('Tweet sent!'))
    assert.equal(tweet.text, 'Tweet sent!')
    assert.equal(submittedTweet, 'local test')
    console.log('PASS: an approved user reaches the simulated X client')
  } finally {
    robot.shutdown()
    await (await require('../lib/cachers/events-cacher')(robot).load()).clearAll()
    await terminate(await require('../lib/fetchers/init-firestore')())
    await eventDoc.delete()
    await deleteApp(adminApp)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

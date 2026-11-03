const { Robot, Adapter, TextMessage } = require('hubot')
const legacyScripts = require('../legacy-scripts.json')
const loadLegacyScripts = require('../lib/load-legacy-scripts')

require('coffeescript/register')

class LocalAdapter extends Adapter {
  async send (envelope, ...strings) { this.emit('message', envelope, strings.join(' ')) }
  async reply (envelope, ...strings) { this.emit('message', envelope, strings.join(' ')) }
  async emote (envelope, ...strings) { this.emit('message', envelope, strings.join(' ')) }
  async run () { this.emit('connected') }
}

async function expectMessage (robot, command, pattern) {
  const response = new Promise((resolve, reject) => {
    const onMessage = (_envelope, text) => {
      if (!pattern.test(text)) return
      clearTimeout(timer)
      robot.adapter.off('message', onMessage)
      resolve(text)
    }
    const timer = setTimeout(() => {
      robot.adapter.off('message', onMessage)
      reject(new Error(`Timed out after: ${command}`))
    }, 5000)
    robot.adapter.on('message', onMessage)
  })
  const user = robot.brain.userForId('ULOCAL', { name: 'local', room: 'CLOCAL' })
  await robot.adapter.receive(new TextMessage(user, command))
  await response
  console.log(`PASS: ${command}`)
}

async function main () {
  process.env.HUBOT_HEROKU_KEEPALIVE_URL = 'https://example.test/'
  process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL = '0'
  const robot = new Robot('local-adapter', false, 'slackbot')
  robot.adapter = new LocalAdapter(robot)
  robot.setupNullRouter()
  await loadLegacyScripts(robot, legacyScripts)
  require('../lib/initializers/heroku-keepalive')(robot)
  require('../lib/initializers/legacy-video-rooms')(robot)
  require('../lib/initializers/legacy-maps')(robot)
  require('../lib/initializers/legacy-shipit')(robot)
  await robot.run()
  try {
    await expectMessage(robot, 'slackbot ping', /PONG/i)
    await expectMessage(robot, 'slackbot echo local check', /local check/)
    await expectMessage(robot, 'slackbot the rules', /A robot (may not|must)/i)
    await expectMessage(robot, 'slackbot thank you', /welcome|problem|pleasure|sure|bother|all right|nothing|not at all|mention it/i)
    await expectMessage(robot, 'slackbot principle me', /./)
    await expectMessage(robot, 'What is bikeshedding?', /Parkinson.*Law of Triviality/i)
    await expectMessage(robot, 'slackbot appearin integration-check', /^https:\/\/meet\.jit\.si\/integration-check$/)
    await expectMessage(robot, 'slackbot map me Lansing, MI', /^https:\/\/www\.google\.com\/maps\/search\//)
    await expectMessage(robot, 'ship it', /^https:\/\/.*\.(?:png|jpg)$/)
    await expectMessage(robot, 'slackbot shoot local in the body', /foam dart|Target acquired|shoot/i)
  } finally {
    robot.shutdown()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

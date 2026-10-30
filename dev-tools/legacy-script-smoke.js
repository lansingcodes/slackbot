const { Robot, Adapter, TextMessage } = require('hubot')
const assert = require('node:assert/strict')
const loadSupportedPackages = require('../lib/load-supported-hubot-packages')

class LocalAdapter extends Adapter {
  async send (envelope, ...strings) { this.emit('message', envelope, strings.join(' ')) }
  async reply (envelope, ...strings) { this.emit('message', envelope, strings.join(' ')) }
  async emote (envelope, ...strings) { this.emit('message', envelope, strings.join(' ')) }
  async run () { this.emit('connected') }
}

async function expectMessage (robot, command, pattern) {
  const response = new Promise((resolve, reject) => {
    const observed = []
    const onMessage = (_envelope, text) => {
      observed.push(text)
      if (!pattern.test(text)) return
      clearTimeout(timer)
      robot.adapter.off('message', onMessage)
      resolve(text)
    }
    const timer = setTimeout(() => {
      robot.adapter.off('message', onMessage)
      reject(new Error(`Timed out after: ${command}; observed: ${observed.join(' | ').slice(0, 300)}`))
    }, 5000)
    robot.adapter.on('message', onMessage)
  })
  const user = robot.brain.userForId('ULOCAL', { name: 'local', room: 'CLOCAL' })
  await robot.adapter.receive(new TextMessage(user, command))
  const text = await response
  console.log(`PASS: ${command}`)
  return text
}

async function main () {
  process.env.HUBOT_HEROKU_KEEPALIVE_URL = 'https://example.test/'
  process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL = '0'
  const robot = new Robot('local-adapter', false, 'slackbot')
  robot.adapter = new LocalAdapter(robot)
  robot.setupNullRouter()
  await loadSupportedPackages(robot)
  for (const name of ['legacy-bikeshed', 'legacy-darts', 'legacy-principles', 'legacy-thank-you']) {
    const filepath = require.resolve(`../lib/initializers/${name}`)
    require(filepath)(robot)
    robot.parseHelp(filepath)
  }
  require('../lib/initializers/heroku-keepalive')(robot)
  require('../lib/initializers/legacy-video-rooms')(robot)
  require('../lib/initializers/legacy-maps')(robot)
  require('../lib/initializers/legacy-shipit')(robot)
  await robot.run()
  try {
    await expectMessage(robot, 'slackbot ping', /PONG/i)
    await expectMessage(robot, 'slackbot adapter', /local-adapter/i)
    await expectMessage(robot, 'slackbot echo local check', /local check/)
    await expectMessage(robot, 'slackbot time', /Server time is:/)
    await expectMessage(robot, 'slackbot the rules', /A robot (may not|must)/i)
    await expectMessage(robot, 'slackbot the rules apple', /A developer (may not|must)/i)
    await expectMessage(robot, 'slackbot thank you', /welcome|problem|pleasure|sure|bother|all right|nothing|not at all|mention it/i)
    await expectMessage(robot, 'slackbot principle me', /./)
    const allPrinciples = await expectMessage(robot, 'slackbot principle all', /You can not expect to have what you want/)
    assert.equal(allPrinciples.split('\n').length, 42)
    assert.match(allPrinciples, /Life’s song is filled with beauty/)
    await expectMessage(robot, 'slackbot principle bomb', /You can not expect to have what you want/)
    await expectMessage(robot, 'slackbot help', /Available commands:/i)
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(JSON.stringify({ hex: { value: '#123ABC', clean: '123ABC' } }), { status: 200 })
    try {
      await expectMessage(robot, 'What is bikeshedding?', /Parkinson.*Law of Triviality/i)
      await expectMessage(robot, 'bikeshed', /#123ABC.*color-hex\.com\/color\/123ABC/i)
      globalThis.fetch = async () => { throw new Error('Color API unavailable') }
      await expectMessage(robot, 'bikeshedding', /thecolorapi\.com is down/i)
    } finally {
      globalThis.fetch = originalFetch
    }
    await expectMessage(robot, 'slackbot appearin integration-check', /^https:\/\/meet\.jit\.si\/integration-check$/)
    await expectMessage(robot, 'slackbot map me Lansing, MI', /^https:\/\/www\.google\.com\/maps\/search\//)
    await expectMessage(robot, 'ship it', /^https:\/\/.*\.(?:png|jpg)$/)
    await expectMessage(robot, 'slackbot shoot local in the body', /fires a foam dart at local's body/i)
    await expectMessage(robot, 'slackbot shoot nobody in the head', /doesn't exist/i)
  } finally {
    robot.shutdown()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

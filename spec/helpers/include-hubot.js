const { Robot, TextMessage, EnterMessage, Adapter } = require('hubot')

class MockAdapter extends Adapter {
  constructor (robot) {
    super(robot)
    this.sent = []
  }

  async send (envelope, ...strings) {
    this.sent.push({ type: 'send', envelope, strings })
    this.emit('send', envelope, strings)
  }

  async reply (envelope, ...strings) {
    this.sent.push({ type: 'reply', envelope, strings })
    this.emit('reply', envelope, strings)
  }

  async topic (envelope, ...strings) {
    this.sent.push({ type: 'topic', envelope, strings })
    this.emit('topic', envelope, strings)
  }

  async run () {
    this.emit('connected')
  }

  close () {
    this.emit('closed')
    super.close()
  }
}

module.exports = () => {
  beforeEach(async () => {
    global.robot = new Robot(null, false, 'slackbot')

    const adapter = new MockAdapter(robot)
    robot.adapter = adapter
    robot.adapterName = 'MockAdapter'

    await robot.run()

    const user = robot.brain.userForId('1', {
      name: 'jasmine',
      room: 'jasmine'
    })

    global.hubotHelpers = {
      receiveMessage: async (message) => {
        await robot.adapter.receive(new TextMessage(user, message))
      },
      receiveEntrance: async (newUser) => {
        await robot.adapter.receive(new EnterMessage(newUser))
      }
    }
  })

  afterEach(() => {
    robot.shutdown()
    delete global.hubotHelpers
  })
}

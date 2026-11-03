module.exports = () => {
  beforeEach(async () => {
    const { Robot, Adapter, TextMessage, EnterMessage } = await import('hubot')

    class MockAdapter extends Adapter {
      async send (envelope, ...strings) { this.emit('send', envelope, strings) }
      async reply (envelope, ...strings) { this.emit('reply', envelope, strings) }
      async run () { this.emit('connected') }
    }

    global.robot = new Robot('mock-adapter', false, 'slackbot')
    robot.adapter = new MockAdapter(robot)

    const user = robot.brain.userForId('1', { name: 'jasmine', room: 'jasmine' })
    global.hubotHelpers = {
      receiveMessage: message => robot.adapter.receive(new TextMessage(user, message)),
      receiveEntrance: newUser => robot.adapter.receive(new EnterMessage(newUser))
    }

    await robot.run()
  })

  afterEach(() => {
    robot.shutdown()
  })
}

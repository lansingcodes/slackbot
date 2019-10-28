describe('new-participant-notifier', () => {
  includeHubot()

  beforeEach(() => {
    require('../../../lib/initializers/new-participant-notifier')(robot)
  })

  it('notifies "chrisvfritz" when a new user enters the "general" room', (done) => {
    const newUser = robot.brain.userForId('2', {
      name: 'new-user',
      room: 'general'
    })

    robot.adapter.on('send', (envelope, strings) => {
      expect(envelope.room).toEqual('@chrisvfritz')
      expect(strings[0]).toEqual('new-user just joined general - just giving you a heads up so they can receive a warm welcome :-)')
      done()
    })

    hubotHelpers.receiveEntrance(newUser)
  })
})

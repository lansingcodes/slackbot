const includeHubot = require('../../helpers/include-hubot')

describe('new-participant-notifier', () => {
  includeHubot()

  beforeEach(() => {
    require('../../../lib/initializers/new-participant-notifier')(robot)
  })

  it('notifies "chrisvfritz" when a new user enters the "general" room', done => {
    const newUser = robot.brain.userForId('2', {
      name: 'new-user',
      room: 'general'
    })

    robot.adapter.on('send', (envelope, strings) => {
      expect(envelope.room).toEqual('@chrisvfritz')
      expect(strings[0]).toEqual(
        'new-user just joined general - just giving you a heads up so they can receive a warm welcome :-)'
      )
      done()
    })

    hubotHelpers.receiveEntrance(newUser)
  })

  it('uses configured Slack IDs for channel and welcomer', async () => {
    process.env.WELCOMER_BY_CHANNEL = '{"C123":"U999"}'
    robot.adapter.client = { fetchConversation: async () => ({ name: 'general' }) }
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)
    const newUser = robot.brain.userForId('2', { name: 'new-user', room: 'C123' })

    try {
      await hubotHelpers.receiveEntrance(newUser)
      expect(sent).toHaveBeenCalled()
      expect(sent.calls.mostRecent().args[0].room).toBe('U999')
      expect(sent.calls.mostRecent().args[1][0]).toContain('new-user just joined general')
    } finally {
      delete process.env.WELCOMER_BY_CHANNEL
    }
  })
})

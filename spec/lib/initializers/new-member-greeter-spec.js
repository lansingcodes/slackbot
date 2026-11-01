const includeHubot = require('../../helpers/include-hubot')

describe('new-member-greeter', () => {
  includeHubot()

  beforeEach(() => {
    process.env.NOTIFICATION_STORE = 'memory'
    require('../../../lib/initializers/new-member-greeter')(robot)
  })

  afterEach(() => {
    delete process.env.MEMBER_GREETING_CHANNEL_ID
    delete process.env.NOTIFICATION_STORE
  })

  it('greets a new member in general and does not repeat the greeting', async () => {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)
    const newcomer = robot.brain.userForId('UNEW', { name: 'newcomer', room: 'general' })

    await hubotHelpers.receiveEntrance(newcomer)
    await hubotHelpers.receiveEntrance(newcomer)

    expect(sent.calls.count()).toBe(1)
    expect(sent.calls.first().args[0].room).toBe('general')
    expect(sent.calls.first().args[1][0]).toContain('<@UNEW> welcome to Lansing Codes!')
    expect(sent.calls.first().args[1][0]).toContain('/code-of-conduct')
    expect(sent.calls.first().args[1][0]).toContain('`upcoming events`')
  })

  it('uses the configured channel ID and ignores other channels and the bot itself', async () => {
    process.env.MEMBER_GREETING_CHANNEL_ID = 'CWELCOME'
    robot.adapter.self = { user_id: 'UBOT', team_id: 'TTEST' }
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)

    await hubotHelpers.receiveEntrance(robot.brain.userForId('UOTHER', { room: 'COTHER' }))
    await hubotHelpers.receiveEntrance(robot.brain.userForId('UBOT', { room: 'CWELCOME' }))
    await hubotHelpers.receiveEntrance(robot.brain.userForId('UNEW', { room: 'CWELCOME' }))

    expect(sent.calls.count()).toBe(1)
    expect(sent.calls.first().args[0].room).toBe('CWELCOME')
  })

  it('does not record a greeting when Slack rejects the post', async () => {
    process.env.MEMBER_GREETING_CHANNEL_ID = 'CWELCOME'
    robot.adapter.client = { web: { chat: { postMessage: jasmine.createSpy('postMessage') } } }
    robot.adapter.client.web.chat.postMessage.and.returnValues(
      Promise.resolve({ ok: false, error: 'not_in_channel' }),
      Promise.resolve({ ok: true })
    )
    spyOn(robot.logger, 'error')
    const newcomer = robot.brain.userForId('UNEW', { room: 'CWELCOME' })

    await hubotHelpers.receiveEntrance(newcomer)
    await hubotHelpers.receiveEntrance(newcomer)

    expect(robot.adapter.client.web.chat.postMessage.calls.count()).toBe(2)
    expect(robot.logger.error).toHaveBeenCalled()
  })
})

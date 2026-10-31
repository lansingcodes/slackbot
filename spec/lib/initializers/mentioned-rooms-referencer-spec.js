const includeHubot = require('../../helpers/include-hubot')
let TextMessage

describe('mentioned-rooms-referencer', () => {
  includeHubot()

  beforeAll(async () => { ({ TextMessage } = await import('hubot')) })

  beforeEach(() => {
    require('../../../lib/initializers/mentioned-rooms-referencer')(robot)
    robot.adapter.self = { url: 'https://lansingcodessystem.slack.com/' }
    robot.adapter.client = {
      web: {
        conversations: {
          list: jasmine.createSpy('list').and.resolveTo({
            channels: [{ id: 'C024BE91L', name: 'test' }],
            response_metadata: { next_cursor: '' }
          })
        }
      }
    }
  })

  const messageFrom = (room, text, rawText) => {
    const message = new TextMessage({ name: 'jasmine', room }, text, '1571842414.003900')
    message.rawText = rawText
    return message
  }

  it('notifies a channel mentioned by name', async () => {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)

    await robot.adapter.receive(messageFrom('C124BE91L', 'See #test for details.'))

    expect(sent).toHaveBeenCalled()
    expect(sent.calls.mostRecent().args[0].room).toBe('C024BE91L')
    expect(sent.calls.mostRecent().args[1][0]).toBe(
      'This channel was just referenced at: https://lansingcodessystem.slack.com/archives/C124BE91L/p1571842414003900'
    )
  })

  it('uses the channel ID in a native Slack mention', async () => {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)

    await robot.adapter.receive(messageFrom('C124BE91L', 'See #test.', 'See <#C024BE91L|test>.'))

    expect(sent).toHaveBeenCalled()
    expect(robot.adapter.client.web.conversations.list).not.toHaveBeenCalled()
  })

  it('does not notify the current channel', async () => {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)
    robot.adapter.client.web.conversations.list.and.resolveTo({
      channels: [{ id: 'C124BE91L', name: 'test' }],
      response_metadata: { next_cursor: '' }
    })

    await robot.adapter.receive(messageFrom('C124BE91L', 'See #test.'))

    expect(sent).not.toHaveBeenCalled()
  })

  it('does not publish direct-message links into a channel', async () => {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)

    await robot.adapter.receive(messageFrom('D123', 'See #test.'))

    expect(sent).not.toHaveBeenCalled()
    expect(robot.adapter.client.web.conversations.list).not.toHaveBeenCalled()
  })
})

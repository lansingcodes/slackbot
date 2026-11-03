const EventEmitter = require('node:events')
const { TextMessage } = require('hubot')
const register = require('../../../lib/initializers/edited-event-commands')

describe('edited-event-commands', () => {
  let socket
  let robot

  beforeEach(() => {
    socket = new EventEmitter()
    robot = {
      adapter: { client: { socket } },
      brain: { userForId: jasmine.createSpy('userForId').and.returnValue({ id: 'U1' }) },
      receive: jasmine.createSpy('receive').and.resolveTo(),
      logger: { error: jasmine.createSpy('error') }
    }
    register(robot)
  })

  it('delivers a newly edited upcoming-events command to Hubot', async () => {
    await socket.listeners('message')[0]({
      body: {
        event: {
          subtype: 'message_changed',
          channel: 'C1',
          previous_message: { text: 'upcoming event' },
          message: { user: 'U1', text: 'upcoming events', ts: '123.456' }
        }
      }
    })

    expect(robot.receive).toHaveBeenCalledOnceWith(jasmine.any(TextMessage))
    const message = robot.receive.calls.mostRecent().args[0]
    expect(message.text).toBe('upcoming events')
    expect(message.room).toBe('C1')
    expect(message.id).toBe('123.456')
  })

  it('ignores ordinary messages, bot edits, and edits of commands already handled', async () => {
    const changed = (before, after, botId) => ({
      body: {
        event: {
          subtype: 'message_changed',
          channel: 'C1',
          previous_message: { text: before },
          message: { user: 'U1', bot_id: botId, text: after, ts: '123.456' }
        }
      }
    })
    const listener = socket.listeners('message')[0]
    await listener(changed('hello', 'hello again'))
    await listener(changed('upcoming events', 'upcoming events please'))
    await listener(changed('hello', 'upcoming events', 'B1'))
    expect(robot.receive).not.toHaveBeenCalled()
  })
})

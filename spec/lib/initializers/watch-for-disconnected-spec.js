const includeHubot = require('../../helpers/include-hubot')

describe('watch-for-disconnected', () => {
  let waitTime
  let hubotRobot
  includeHubot()

  beforeEach(() => {
    hubotRobot = global.robot

    // Load our module under test
    require('../../../lib/initializers/watch-for-disconnected')(hubotRobot)

    // Control the clock for unit testing
    waitTime = parseInt(process.env.SLACKBOT_DISCONNECT_WAIT_TIME)
    jasmine.clock().install()
  })

  afterEach(() => {
    jasmine.clock().uninstall()
  })

  it('does NOT start a timer without a match', () => {
    expect(() => {
      hubotRobot.logger.info('Some message that we should not trigger on')
      jasmine.clock().tick(waitTime + 1)
    }).not.toThrow()
  })

  it('starts a timer when the adapter disconnects', () => {
    expect(() => {
      hubotRobot.adapter.emit('disconnected')
      jasmine.clock().tick(waitTime + 1)
    }).toThrow(new Error('Force restarting due to disconnect'))
  })

  it('also responds to log messages for backwards compatibility', () => {
    expect(() => {
      hubotRobot.logger.info('Slack client closed, waiting for reconnect')
      jasmine.clock().tick(waitTime + 1)
    }).toThrow(new Error('Force restarting due to disconnect'))
  })

  it('cancels a timer that has been started if the client reconnects', () => {
    expect(() => {
      hubotRobot.adapter.emit('disconnected')
      hubotRobot.adapter.emit('connected')
      jasmine.clock().tick(waitTime + 1)
    }).not.toThrow()
  })
})

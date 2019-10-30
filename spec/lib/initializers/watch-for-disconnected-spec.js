describe('watch-for-disconnected', () => {
  let waitTime
  includeHubot()

  beforeEach(() => {
    // Signal test start
    console.log('\n<HUBOT-STDOUT>')

    // Load our module under test
    require('../../../lib/initializers/watch-for-disconnected')(robot)

    // Control the clock for unit testing
    waitTime = parseInt(process.env.SLACKBOT_DISCONNECT_WAIT_TIME)
    jasmine.clock().install()
  })

  afterEach(() => {
    console.log('</HUBOT-STDOUT>')

    jasmine.clock().uninstall()
  })

  it('does NOT start a timer without a match', () => {
    expect(() => {
      robot.logger.info('Some message that we should not trigger on')
      jasmine.clock().tick(waitTime + 1)
    }).not.toThrow()
  })

  it('starts a timer when a disconnect is detected', () => {
    expect(() => {
      robot.logger.info('Slack client closed, waiting for reconnect')
      jasmine.clock().tick(waitTime + 1)
    }).toThrow(new Error('Force restarting due to disconnect'))
  })

  it('cancels a timer that has been started if the client reconnects', () => {
    expect(() => {
      robot.logger.info('Slack client closed, waiting for reconnect')
      robot.logger.info('Slack client now connected')
      jasmine.clock().tick(waitTime + 1)
    }).not.toThrow()
  })
})

const proxyquire = require('proxyquire')

describe('watch-for-disconnected', () => {
  let waitTime
  let receiveOutput

  beforeEach(() => {
    const initialize = proxyquire('../../../lib/initializers/watch-for-disconnected', {
      'intercept-stdout': callback => { receiveOutput = callback }
    })
    initialize({})
    waitTime = parseInt(process.env.SLACKBOT_DISCONNECT_WAIT_TIME)
    jasmine.clock().install()
  })

  afterEach(() => jasmine.clock().uninstall())

  it('does NOT start a timer without a match', () => {
    expect(() => {
      receiveOutput('Some message that we should not trigger on')
      jasmine.clock().tick(waitTime + 1)
    }).not.toThrow()
  })

  it('starts a timer when a disconnect is detected', () => {
    expect(() => {
      receiveOutput('Slack client closed, waiting for reconnect')
      jasmine.clock().tick(waitTime + 1)
    }).toThrow(new Error('Force restarting due to disconnect'))
  })

  it('cancels a timer that has been started if the client reconnects', () => {
    expect(() => {
      receiveOutput('Slack client closed, waiting for reconnect')
      receiveOutput('Slack client now connected')
      jasmine.clock().tick(waitTime + 1)
    }).not.toThrow()
  })
})

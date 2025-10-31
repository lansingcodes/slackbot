const herokuKeepalive = require('../../../lib/initializers/heroku-keepalive')

describe('heroku-keepalive', () => {
  let robot
  const originalUrl = process.env.HUBOT_HEROKU_KEEPALIVE_URL
  const originalHerokuUrl = process.env.HEROKU_URL
  const originalInterval = process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL

  beforeEach(() => {
    const httpClient = {
      auth: jasmine.createSpy('auth').and.callFake(() => httpClient),
      post: jasmine.createSpy('post').and.returnValue(callback => callback(null, { statusCode: 200 }, 'OK'))
    }
    robot = {
      logger: {
        warn: jasmine.createSpy('warn'),
        info: jasmine.createSpy('info'),
        error: jasmine.createSpy('error')
      },
      http: jasmine.createSpy('http').and.returnValue(httpClient),
      emit: jasmine.createSpy('emit'),
      router: {
        post: jasmine.createSpy('router.post'),
        get: jasmine.createSpy('router.get')
      }
    }
    jasmine.clock().install()
    jasmine.clock().mockDate(new Date('2020-01-01T12:00:00Z'))
    delete process.env.HUBOT_HEROKU_KEEPALIVE_URL
    delete process.env.HEROKU_URL
    delete process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL
  })

  afterEach(() => {
    jasmine.clock().uninstall()
    if (originalUrl) {
      process.env.HUBOT_HEROKU_KEEPALIVE_URL = originalUrl
    } else {
      delete process.env.HUBOT_HEROKU_KEEPALIVE_URL
    }

    if (originalHerokuUrl) {
      process.env.HEROKU_URL = originalHerokuUrl
    } else {
      delete process.env.HEROKU_URL
    }

    if (originalInterval) {
      process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL = originalInterval
    } else {
      delete process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL
    }
    if (robot.herokuKeepaliveIntervalId) {
      clearInterval(robot.herokuKeepaliveIntervalId)
    }
  })

  it('warns and skips setup when no URL is provided', () => {
    herokuKeepalive(robot)

    expect(robot.logger.warn).toHaveBeenCalledWith('heroku-keepalive skipped: HUBOT_HEROKU_KEEPALIVE_URL/HEROKU_URL not set')
    expect(robot.router.post).not.toHaveBeenCalled()
  })

  it('pings immediately and registers routes when configured', () => {
    process.env.HUBOT_HEROKU_KEEPALIVE_URL = 'https://example.com'
    process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL = '0.1'

    herokuKeepalive(robot)

    expect(robot.router.post).toHaveBeenCalledWith('/heroku/keepalive', jasmine.any(Function))
    expect(robot.router.get).toHaveBeenCalledWith('/heroku/keepalive', jasmine.any(Function))
    expect(robot.http).toHaveBeenCalledWith('https://example.com/heroku/keepalive')
  })
})

const proxyquire = require('proxyquire').noCallThru()

describe('check-for-upcoming-events in Lansing time', () => {
  beforeEach(() => {
    jasmine.clock().install()
    jasmine.clock().mockDate(new Date('2026-11-17T14:00:00Z'))
  })

  afterEach(() => jasmine.clock().uninstall())

  it('announces an 8 PM Lansing event as today with the right time', async () => {
    const event = {
      id: 'devops',
      group: 'devops',
      name: 'Evening workshop',
      url: 'https://example.org/evening-workshop',
      startTime: Date.parse('2026-11-18T01:00:00Z')
    }
    const task = proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
      '../helpers/choose-beverage': () => [{ article: 'a', name: 'coffee' }, 'coffee time'],
      '../cachers/events-cacher': () => ({ cache: () => {}, alreadyNotifiedRegarding: () => false }),
      '../fetchers/events-fetcher': () => Promise.resolve({ upcoming: () => Promise.resolve([event]) }),
      '../helpers/generate-welcome-email-for': () => {}
    })
    const robot = { messageRoom: jasmine.createSpy('messageRoom') }

    task(robot)
    await new Promise(resolve => setImmediate(resolve))

    expect(robot.messageRoom).toHaveBeenCalledWith(
      'devops',
      jasmine.stringMatching(/Meetup today!.*8:00pm/)
    )
    expect(robot.messageRoom).toHaveBeenCalledWith(
      'general',
      jasmine.stringMatching(/Meetup today!.*8:00pm/)
    )
  })
})

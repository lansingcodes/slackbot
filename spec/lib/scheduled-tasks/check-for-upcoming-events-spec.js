const proxyquire = require('proxyquire')

describe('check-for-upcoming-events', () => {
  it('uses configured Slack channel IDs for announcements and group reminders', async () => {
    const oldAnnouncement = process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID
    const oldGroups = process.env.EVENT_GROUP_CHANNEL_IDS
    process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID = 'CANNOUNCE'
    process.env.EVENT_GROUP_CHANNEL_IDS = '{"javascript":"CJS"}'
    try {
      const eventDate = new Date()
      eventDate.setDate(eventDate.getDate() + 7)
      const event = {
        id: 'event-id',
        group: 'javascript',
        name: 'JavaScript Meetup',
        url: 'https://example.test/event',
        startTime: eventDate.valueOf()
      }
      const run = proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
        '../helpers/choose-beverage': () => [{ article: 'a', name: 'coffee' }, ':coffee:'],
        '../cachers/events-cacher': () => ({ alreadyNotifiedRegarding: item => item.id === event.id, cache: () => {} }),
        '../fetchers/events-fetcher': async () => ({ upcoming: async () => [event] }),
        '../helpers/is-today': () => false,
        '../helpers/generate-welcome-email-for': () => {}
      })
      const robot = { messageRoom: jasmine.createSpy('messageRoom'), logger: { error: jasmine.createSpy('error') } }

      await run(robot)

      expect(robot.messageRoom.calls.allArgs().some(args => args[0] === 'CANNOUNCE')).toBeTrue()
      expect(robot.messageRoom.calls.allArgs().some(args => args[0] === 'CJS')).toBeTrue()
    } finally {
      if (oldAnnouncement === undefined) delete process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID
      else process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID = oldAnnouncement
      if (oldGroups === undefined) delete process.env.EVENT_GROUP_CHANNEL_IDS
      else process.env.EVENT_GROUP_CHANNEL_IDS = oldGroups
    }
  })

  it('routes group reminders using the group key rather than the event ID', async () => {
    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + 7)
    const event = {
      id: 'meetup-calendar-uid',
      group: 'javascript',
      name: 'JavaScript Meetup',
      url: 'https://www.meetup.com/test/events/123/',
      startTime: eventDate.valueOf()
    }
    const run = proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
      '../helpers/choose-beverage': () => [{ article: 'a', name: 'coffee' }, ':coffee:'],
      '../cachers/events-cacher': () => ({ alreadyNotifiedRegarding: item => item.id === event.id, cache: () => {} }),
      '../fetchers/events-fetcher': async () => ({ upcoming: async () => [event] }),
      '../helpers/is-today': () => false,
      '../helpers/generate-welcome-email-for': () => {}
    })
    const robot = { messageRoom: jasmine.createSpy('messageRoom'), logger: { error: jasmine.createSpy('error') } }

    await run(robot)

    expect(robot.messageRoom.calls.allArgs().some(args => args[0] === 'javascript')).toBeTrue()
  })

  it('does not repeat the same day reminder on subsequent checks', async () => {
    const notified = new Set()
    const event = {
      id: 'meetup-calendar-uid',
      group: 'catech',
      name: 'Community Meetup',
      url: 'https://www.meetup.com/catech/events/123/',
      startTime: Date.now()
    }
    const run = proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
      '../helpers/choose-beverage': () => [{ article: 'a', name: 'coffee' }, ':coffee:'],
      '../cachers/events-cacher': () => ({
        alreadyNotifiedRegarding: item => notified.has(item.id),
        cache: item => notified.add(item.id)
      }),
      '../fetchers/events-fetcher': async () => ({ upcoming: async () => [event] }),
      '../helpers/is-today': () => true,
      '../helpers/generate-welcome-email-for': () => {}
    })
    const robot = { messageRoom: jasmine.createSpy('messageRoom'), logger: { error: jasmine.createSpy('error') } }

    await run(robot)
    await run(robot)

    const todayAnnouncements = robot.messageRoom.calls.allArgs()
      .filter(args => args[1].includes('Meetup today!'))
    expect(todayAnnouncements.length).toBe(1)
  })
})

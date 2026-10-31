const proxyquire = require('proxyquire')

const makeCacher = (alreadyNotifiedRegarding, cache) => () => ({
  load: async () => {},
  alreadyNotifiedRegarding,
  cache,
  async deliverOnce (item, send, alsoCache = []) {
    if (alreadyNotifiedRegarding(item)) return false
    await send()
    await cache(item)
    for (const alias of alsoCache) await cache(alias)
    return true
  }
})

describe('check-for-upcoming-events', () => {
  it('does not cache a reminder that Slack failed to post', async () => {
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
      const cache = jasmine.createSpy('cache')
      const run = proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
        '../helpers/choose-beverage': () => [{ article: 'a', name: 'coffee' }, ':coffee:'],
        '../cachers/events-cacher': makeCacher(item => item.id === event.id, cache),
        '../fetchers/events-fetcher': async () => ({ upcoming: async () => [event] }),
        '../helpers/is-today': () => false
      })
      const postMessage = jasmine.createSpy('postMessage').and.callFake(async ({ channel }) => {
        if (channel === 'CJS') throw new Error('Slack unavailable')
        return { ok: true }
      })
      const robot = {
        adapter: { client: { web: { chat: { postMessage } } } },
        messageRoom: jasmine.createSpy('messageRoom'),
        logger: { error: jasmine.createSpy('error') }
      }

      await run(robot)

      expect(cache).not.toHaveBeenCalled()
      expect(robot.logger.error).toHaveBeenCalledWith('Could not check upcoming events: Slack unavailable')
    } finally {
      if (oldAnnouncement === undefined) delete process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID
      else process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID = oldAnnouncement
      if (oldGroups === undefined) delete process.env.EVENT_GROUP_CHANNEL_IDS
      else process.env.EVENT_GROUP_CHANNEL_IDS = oldGroups
    }
  })

  it('identifies a malformed channel mapping instead of blaming Firestore', async () => {
    const original = process.env.EVENT_GROUP_CHANNEL_IDS
    process.env.EVENT_GROUP_CHANNEL_IDS = "{devops:'C123'}"
    try {
      const run = proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
        '../helpers/choose-beverage': () => [{ article: 'a', name: 'coffee' }, ':coffee:'],
        '../cachers/events-cacher': makeCacher(() => false, () => {}),
        '../fetchers/events-fetcher': async () => ({ upcoming: async () => [{ id: 'event-1', group: 'devops', startTime: Date.now() }] })
      })
      const robot = { messageRoom: jasmine.createSpy('messageRoom'), logger: { error: jasmine.createSpy('error') } }

      await run(robot)

      expect(robot.logger.error).toHaveBeenCalledWith(
        'Could not check upcoming events: EVENT_GROUP_CHANNEL_IDS must be valid JSON with double-quoted property names and string values'
      )
    } finally {
      if (original === undefined) delete process.env.EVENT_GROUP_CHANNEL_IDS
      else process.env.EVENT_GROUP_CHANNEL_IDS = original
    }
  })

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
        '../cachers/events-cacher': makeCacher(item => item.id === event.id, () => {}),
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
      '../cachers/events-cacher': makeCacher(item => item.id === event.id, () => {}),
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
      '../cachers/events-cacher': makeCacher(item => notified.has(item.id), item => notified.add(item.id)),
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

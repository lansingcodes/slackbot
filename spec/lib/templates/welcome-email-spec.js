const proxyquire = require('proxyquire')

describe('welcome-email', () => {
  const event = {
    id: 'calendar-uid',
    group: 'catech',
    name: 'Community gathering',
    url: 'https://www.meetup.com/catech/events/305626180/',
    startTime: Date.now()
  }
  let templateUrl
  let welcomeEmail

  beforeEach(() => {
    process.env.ORGANIZER_BY_GROUP = '{"catech":"U123"}'
    process.env.ORGANIZER_FIRST_NAME_BY_GROUP = '{"catech":"Alex"}'
    welcomeEmail = proxyquire('../../../lib/templates/welcome-email', {
      '../helpers/shorten-url': (url, onShortUrl) => {
        templateUrl = url
        onShortUrl(url)
      }
    })
  })

  afterEach(() => {
    delete process.env.ORGANIZER_BY_GROUP
    delete process.env.ORGANIZER_FIRST_NAME_BY_GROUP
  })

  it('uses the Meetup slug and event ID from the event URL', () => {
    welcomeEmail(event, () => {})

    expect(templateUrl).toContain('/catech/messages/send/')
    expect(templateUrl).toContain('eventId=305626180')
    expect(templateUrl).not.toContain('eventId=calendar-uid')
  })

  it('includes the configured organizer name in the template', () => {
    welcomeEmail(event, () => {})
    const body = new URL(templateUrl).searchParams.get('body')

    expect(body).toContain('<p>Alex</p>')
    expect(body).not.toContain('<p>U123</p>')
  })

  it('uses available event location and omits stale venue and phone claims', () => {
    welcomeEmail({ ...event, venue: 'Community Hall', address: '123 Main St' }, () => {})
    const body = new URL(templateUrl).searchParams.get('body')

    expect(body).toContain('Community Hall — 123 Main St')
    expect(body).toContain('event page')
    expect(body).not.toContain('ORGANIZER_PHONE')
    expect(body).not.toContain('MSU parking structure')
    expect(body).not.toContain('Cottage Inn')
  })

  it('escapes event text before adding it to the HTML draft', () => {
    welcomeEmail({ ...event, name: '<script>alert(1)</script>' }, () => {})
    const body = new URL(templateUrl).searchParams.get('body')

    expect(body).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(body).not.toContain('<script>')
  })
})

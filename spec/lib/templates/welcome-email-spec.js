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
})

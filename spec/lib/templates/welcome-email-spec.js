const proxyquire = require('proxyquire').noCallThru()

describe('welcome-email', () => {
  let shortenUrlSpy
  let welcomeEmail
  const event = {
    id: '222664930',
    name: "Today's new JavaScript framework",
    group: {
      id: 'javascript',
      name: 'Lansing Javascript Meetup',
      meetupUrlName: 'Lansing-Javascript-Meetup'
    },
    description: 'tbd',
    url: 'https://www.meetup.com/Lansing-Javascript-Meetup/events/222664930/',
    venue: 'the moon',
    address: '1 solar system way',
    startTime: Date.now()
  }

  beforeEach(() => {
    shortenUrlSpy = jasmine.createSpy('shortenUrl').and.callFake((url, callback) => {
      /* eslint-disable n/no-callback-literal */
      callback('https://short.test/welcome-email')
      /* eslint-enable n/no-callback-literal */
    })

    welcomeEmail = proxyquire('../../../lib/templates/welcome-email', {
      '../helpers/shorten-url': shortenUrlSpy
    })
  })

  it('invokes the shortener with the meetup message URL and returns the shortened value', done => {
    welcomeEmail(event, shortUrl => {
      expect(shortenUrlSpy).toHaveBeenCalledTimes(1)
      expect(shortenUrlSpy.calls.argsFor(0)[0]).toContain(event.group.meetupUrlName)
      expect(shortUrl).toEqual('https://short.test/welcome-email')
      done()
    })
  })

  it('URL encodes the email subject and body', done => {
    welcomeEmail(event, () => {
      const generatedUrl = shortenUrlSpy.calls.argsFor(0)[0]
      const expectedSubject = encodeURIComponent(`${event.name} Today!`)
      expect(generatedUrl).toContain(`subject=${expectedSubject}`)
      expect(generatedUrl).toContain('body=%3Cp%3EFellow')
      done()
    })
  })
})

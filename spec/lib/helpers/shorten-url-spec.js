const TinyURL = require('tinyurl')
const shortenUrl = require('../../../lib/helpers/shorten-url')

describe('shorten-url', () => {
  it('passes the TinyURL result to the caller', () => {
    const longUrl = 'https://www.meetup.com/example/event/123'
    const shortUrl = 'https://tinyurl.com/example'
    spyOn(TinyURL, 'shorten').and.callFake((url, callback) => {
      expect(url).toBe(longUrl)
      callback(shortUrl)
    })

    const callback = jasmine.createSpy('callback')
    shortenUrl(longUrl, callback)

    expect(TinyURL.shorten).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledOnceWith(shortUrl)
  })
})

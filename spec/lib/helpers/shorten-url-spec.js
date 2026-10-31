const TinyURL = require('tinyurl')
const shortenUrl = require('../../../lib/helpers/shorten-url')

describe('shorten-url', () => {
  it('passes the URL and shortened result through to the callback', (done) => {
    const longUrl = 'https://www.meetup.com/example/event/123'
    const shortUrl = 'https://tinyurl.com/example'
    const shorten = spyOn(TinyURL, 'shorten').and.callFake((url, callback) => callback(shortUrl))

    shortenUrl(longUrl, (result) => {
      expect(shorten).toHaveBeenCalledWith(longUrl, jasmine.any(Function))
      expect(result).toBe(shortUrl)
      done()
    })
  })
})

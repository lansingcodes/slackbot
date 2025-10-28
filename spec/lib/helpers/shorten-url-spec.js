const TinyURL = require('tinyurl')
const shortenUrl = require('../../../lib/helpers/shorten-url')

describe('shorten-url', () => {
  beforeEach(() => {
    spyOn(TinyURL, 'shorten').and.callFake((longUrl, cb) => {
      const encoded = Buffer.from(longUrl)
        .toString('base64')
        .replace(/[+/=]/g, '')
        .slice(0, 8)
      cb(`https://tinyurl.com/${encoded}`)
    })
  })

  it('produces a URL beginning with "https://tinyurl.com/"', (done) => {
    shortenUrl('http://www.google.com', (shortUrl) => {
      expect(shortUrl.startsWith('https://tinyurl.com/')).toBeTrue()
      done()
    })
  })
})

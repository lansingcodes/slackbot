const shortenUrl = require('../../../lib/helpers/shorten-url')

describe('shorten-url', () => {
  it('produces a URL beginning with "https://tinyurl.com/"', (done) => {
    shortenUrl('http://www.google.com', (shortUrl) => {
      expect(shortUrl.startsWith('https://tinyurl.com/')).toBeTrue()
      done()
    })
  })
})

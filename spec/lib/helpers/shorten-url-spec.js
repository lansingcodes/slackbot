const shortenUrl = require('../../../lib/helpers/shorten-url')

describe('shorten-url', () => {
  let shortUrl

  describe('when shortening "http://www.google.com/"', () => {
    beforeEach((done) => {
      shortenUrl('http://www.google.com/', (url) => {
        shortUrl = url
        done()
      })
    })

    it('should return a URL beginning with "http://goo.gl/"', () => {
      expect(shortUrl.match('http://tinyurl.com/')).toBeTruthy()
    })
  })
})

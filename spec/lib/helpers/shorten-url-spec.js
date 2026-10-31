const shortenUrl = require('../../../lib/helpers/shorten-url')
const https = require('https')
const fs = require('fs')

describe('shorten-url', () => {
  it('produces a URL beginning with "https://tinyurl.com/"', (done) => {
    const originalGet = https.get
    spyOn(https, 'get').and.callFake((url, onResponse) => originalGet(url, response => {
      fs.writeSync(2, `[TinyURL diagnostic] HTTP status=${response.statusCode}\n`)
      onResponse(response)
    }))

    shortenUrl('http://www.google.com', (shortUrl) => {
      const result = shortUrl === 'Error'
        ? 'Error'
        : typeof shortUrl === 'string' && shortUrl.startsWith('https://tinyurl.com/')
          ? 'TinyURL link'
          : typeof shortUrl
      fs.writeSync(2, `[TinyURL diagnostic] callback=${result}\n`)
      expect(shortUrl.startsWith('https://tinyurl.com/')).toBeTrue()
      done()
    })
  })
})

const TinyURL = require('tinyurl')

const ensureHttps = (url) => {
  if (!url) return url
  return url.replace(/^http:\/\//i, 'https://')
}

const tryShorten = (longUrl, callback, { retriedWithHttps } = { retriedWithHttps: false }) => {
  TinyURL.shorten(longUrl, (shortUrl, err) => {
    if (err || !shortUrl || shortUrl === 'Error') {
      if (!retriedWithHttps && longUrl.startsWith('http://')) {
        const secureLongUrl = ensureHttps(longUrl)
        return tryShorten(secureLongUrl, callback, { retriedWithHttps: true })
      }

      return callback(shortUrl && shortUrl !== 'Error' ? shortUrl : longUrl)
    }

    callback(ensureHttps(shortUrl))
  })
}

module.exports = (longUrl, callback) => {
  tryShorten(longUrl, callback)
}

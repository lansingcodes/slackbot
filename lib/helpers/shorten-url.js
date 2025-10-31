const TinyURL = require('tinyurl')

const ensureHttps = (url) => {
  if (!url) return url
  return url.replace(/^http:\/\//i, 'https://')
}

const tryShorten = (longUrl, callback, { retriedWithHttps } = { retriedWithHttps: false }) => {
  TinyURL.shorten(longUrl, (...args) => {
    const [firstArg, secondArg] = args

    const shortUrl = typeof firstArg === 'string' && firstArg
      ? firstArg
      : (typeof secondArg === 'string' && secondArg ? secondArg : null)

    const error = (firstArg instanceof Error ? firstArg : null) || (secondArg instanceof Error ? secondArg : null)

    if (error || !shortUrl || shortUrl === 'Error') {
      if (!retriedWithHttps && /^http:\/\//i.test(longUrl)) {
        return tryShorten(ensureHttps(longUrl), callback, { retriedWithHttps: true })
      }

      callback(ensureHttps(longUrl))
      return
    }

    callback(ensureHttps(shortUrl))
  })
}

module.exports = (longUrl, callback) => {
  tryShorten(longUrl, callback)
}

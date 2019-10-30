const TinyURL = require('tinyurl')

module.exports = (longUrl, callback) => {
  TinyURL.shorten(longUrl, (shortUrl) => callback(shortUrl))
}

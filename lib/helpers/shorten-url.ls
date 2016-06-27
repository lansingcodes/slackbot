require! { 'tinyurl': TinyURL }

module.exports = (long-url, callback) !->

  TinyURL.shorten long-url, (short-url) !->
    callback short-url

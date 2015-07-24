require! { 'google-url': GoogleURL }

module.exports = (long-url, callback) !->

  google-url = new GoogleURL key: process.env.GOOGLE_API_KEY

  google-url.shorten long-url, (error, short-url) !->
    return console.log(error) if error
    callback short-url

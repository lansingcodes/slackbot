require! { 'google-url': GoogleURL }

module.exports = (long-url, callback) !->

  const google-url = new GoogleURL key: process.env.GOOGLE_API_KEY

  google-url.shorten long-url, (error, short-url) !->
    if error?
      callback long-url
      console.log("Google couldn't shorten URL:", error)
      return
    callback short-url

const Twitter = require('twitter-node-client').Twitter

const twitterClient = new Twitter({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

module.exports = (text, errorCallback, successCallback) => {
  twitterClient.postTweet(
    text,
    response => errorCallback(JSON.stringify(response)),
    successCallback
  )
}

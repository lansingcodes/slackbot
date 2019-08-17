require! {
  'twitter-node-client': { Twitter }
}

const twitter-client = new Twitter do
  consumer-key: process.env.TWITTER_CONSUMER_KEY
  consumer-secret: process.env.TWITTER_CONSUMER_SECRET
  access-token: process.env.TWITTER_ACCESS_TOKEN
  access-token-secret: process.env.TWITTER_ACCESS_TOKEN_SECRET

module.exports = (text, error-callback, success-callback) ->

  twitter-client.post-tweet do
    status: text
    (response) -> error-callback JSON.stringify response
    success-callback

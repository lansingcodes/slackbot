const { TwitterApi } = require('twitter-api-v2')

module.exports = async (text, errorCallback, successCallback) => {
  const appKey = process.env.TWITTER_CONSUMER_KEY
  const appSecret = process.env.TWITTER_CONSUMER_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  if (![appKey, appSecret, accessToken, accessSecret].every(Boolean)) {
    errorCallback('X API credentials are not configured')
    return
  }

  try {
    const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
    await client.v2.tweet(text)
    successCallback()
  } catch (error) {
    errorCallback(error.message || 'X API request failed')
  }
}

// Description:
//   Send tweets from your Twitter bot.
//
// Dependencies:
//   "twitter-api-v2"
//
// Configuration:
//   TWITTER_CONSUMER_KEY        - X developer app key.
//   TWITTER_CONSUMER_SECRET     - X developer app secret.
//   TWITTER_ACCESS_TOKEN        - OAuth 1.0a user access token with write access.
//   TWITTER_ACCESS_TOKEN_SECRET - OAuth 1.0a user access token secret.
//
// Commands:
//   hubot tweet <message> - Send the message as a tweet from the bot on
//                           Twitter. Approved users only.
//
// Notes:
//   The list of users approved to send tweets is hard-coded in this script.
//
// Author:
//   chrisvfritz
const tweet = require('../helpers/tweet')
const getDeniedGif = require('../helpers/get-denied-gif')

const approvedTweeters = [
  'chrisvfritz',
  'davin',
  'leo',
  'erik.gillespie',
  'katiemfritz'
]
const denialStr = deniedGifUrl => `No tweet for you!
${deniedGifUrl}
Only the following users have access: ${approvedTweeters.join(', ')}`

module.exports = robot => {
  robot.respond(/tweet (.+)/i, response => {
    const userName = response.envelope.user.name
    const approvedIds = (process.env.APPROVED_TWEETER_IDS || '')
      .split(',').map(id => id.trim()).filter(Boolean)
    const approved = approvedIds.length > 0
      ? approvedIds.includes(response.envelope.user.id)
      : approvedTweeters.includes(userName)
    if (approved) {
      tweet(
        response.match[1],
        error => response.send(`Tweet failed. :-( Error: ${error}`),
        () => response.send('Tweet sent!')
      )
    } else {
      response.send(denialStr(getDeniedGif()))
    }
  })
}

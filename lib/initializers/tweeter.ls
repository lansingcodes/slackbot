# Description:
#   Send tweets from your Twitter bot.
#
# Dependencies:
#   "twitter-node-client"
#
# Configuration:
#   TWITTER_CONSUMER_KEY        - Consumer key which identifies your Twitter bot app.
#   TWITTER_CONSUMER_SECRET     - Secret for your consumer key.
#   TWITTER_ACCESS_TOKEN        - OAuth access token granted by Twitter.
#   TWITTER_ACCESS_TOKEN_SECRET - Secret for your access token.
#
# Commands:
#   hubot tweet <message> - Send the message as a tweet from the bot on Twitter. Approved users only.
#
# Notes:
#   The list of users approved to send tweets is hard-coded in this script.
#
# Author:
#   chrisvfritz

require! {
  '../helpers/tweet'
  '../helpers/get-denied-gif'
}

const approved-tweeters = <[
  chrisvfritz
  davin
  leo
  erik.gillespie
  katiemfritz
]>

module.exports = (robot) !->

  robot.respond /tweet (.+)/i, (message) !->

    tweet-text = message.match.1

    if message.envelope.user.name in approved-tweeters

      tweet do
        tweet-text
        (error) !->
          message.send "Tweet failed. :-( Error: #{error}"
        !->
          message.send "Tweet sent!"

    else

      message.send "No tweet for you!\n#{get-denied-gif!}\nOnly the following users have access: #{approved-tweeters.join ', '}"

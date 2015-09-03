require! {
  '../helpers/tweet'
  '../helpers/get-denied-gif'
}

const approved-tweeters = <[ chrisvfritz davin leo ]>

module.exports = (robot) !->

  robot.hear /^tweet (.+)/i, (message) !->

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

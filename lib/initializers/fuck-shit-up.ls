require! {
  '../helpers/get-denied-gif'
}

const approved-fuckers = <[ chrisvfritz atomaka ]>

module.exports = (robot) !->

  robot.respond /fuck shit up/i, (message) !->

    if message.envelope.user.name in approved-fuckers

      message.send "Shit fucked up!"
      throw new Error('Manually throwing an error so that lubot restarts.')

    else

      message.send "You do not have access to fuck shit up!\n#{get-denied-gif!}\nOnly the following users have access: #{approved-fuckers.join ', '}"

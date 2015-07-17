module.exports = (robot) !->

  robot.respond /identify me/, (message) !->
    console.log JSON.stringify message.envelope.user
    message.send "Just sent some user info to the server logs."

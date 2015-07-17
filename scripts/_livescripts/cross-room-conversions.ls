module.exports = (robot) !->

  robot.hear /#(\w+)/, (message) !->

    possible-room = message.match.1
    user-room = message.envelope.user.room

    # unless possible-room is user-room
    # robot.message-room
    console.log possible-room
    console.log user-room
    console.log JSON.stringify Object.keys message.message

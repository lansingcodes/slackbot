module.exports = (robot) !->

  robot.hear /#(\w+)/, (message) !->

    possible-room = message.match.1
    user-room = message.envelope.user.room
    message-id = message.message.id?replace /\./g, ''

    unless possible-room is user-room
      robot.message-room possible-room, "This channel was just referenced at: https://lansingcodes.slack.com/archives/#{user-room}/p#{message-id}"

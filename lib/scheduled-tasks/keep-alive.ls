const debug-room = \debug

module.exports = (robot) !->
  robot.message-room debug-room, "Attempting to stay alive"

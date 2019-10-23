# Description:
#   Notifies a channel's designated welcomer when a new user joins the channel.
#
# Dependencies:
#   N/A
#
# Configuration:
#   N/A
#
# Commands:
#   N/A
#
# Notes:
#   Welcomers for each channel are hard-coded in the script.
#
# Author:
#   chrisvfritz

welcomer-for = (room) ->
  {
    'general': \chrisvfritz
    'devops': \davin
    'ruby': \atomaka
    'javascript': \leo
    'mobile': \leo
  }[room]

module.exports = (robot) !->

  robot.enter (message) !->

    room = message.envelope.user.room
    user = message.envelope.user.name
    welcomer = welcomer-for room

    if welcomer?
      robot.message-room '@' + welcomer, "#{user} just joined #{room} - just giving you a heads up so they can receive a warm welcome :-)"

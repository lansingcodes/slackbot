# Description:
#   Reconnect the bot when it gets disconnected from Slack.
#
# Dependencies:
#   "intercept-stdout"
#
# Configuration:
#   SLACKBOT_DISCONNECT_WAIT_TIME - Duration in milliseconds to wait for reconnection before force restarting the client. Hard-coded to 20000
#
# Commands:
#   N/A
#
# Notes:
#   N/A
#
# Author:
#   chrisvfritz

intercept = require 'intercept-stdout'

const wait-time = 20_000
process.env.SLACKBOT_DISCONNECT_WAIT_TIME = wait-time

module.exports = (robot) !->
  timer = null

  intercept (text) !->

    if /slack client closed, waiting for reconnect/i.test text

      timer := set-timeout do
        !-> throw new Error 'Force restarting due to disconnect'
        wait-time
      return

    if /slack client now connected/i.test text

      clear-timeout timer
      return

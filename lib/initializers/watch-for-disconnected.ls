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

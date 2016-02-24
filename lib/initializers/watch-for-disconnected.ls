intercept = require 'intercept-stdout'

module.exports = (robot) !->
  timer = null

  unhook_intercept = intercept (txt) !->

    if txt.match //slack client closed, waiting for reconnect//i

      clearTimeout timer
      timer := setTimeout (-> throw new Error 'Force restarting due to disconnect'), 60 * 1000

    else if txt.match //slack client now connected//i

      clearTimeout timer

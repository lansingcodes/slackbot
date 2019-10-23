# Description:
#   Schedules recurring execution of scripts.
#
# Dependencies:
#   "cron"
#
# Configuration:
#   N/A
#
# Commands:
#   N/A
#
# Notes:
#   N/A
#
# Author:
#   chrisvfritz
#   egillespie

CronJob = require('cron').CronJob

module.exports = (robot) !->

  schedule = (cron-time, module) !->
    run-module = !-> require("../scheduled-tasks/#{module}")(robot)
    new CronJob cron-time, run-module, null, true, 'America/Detroit'

  if process.env.DEBUG?
    schedule '*/10 * * * * *', \check-for-upcoming-events
    # schedule '*/10 * * * * *', \prompt-standup
    # schedule '*/13 * * * * *', \remind-about-standup
  else
    schedule '0 0 9 * * *', \check-for-upcoming-events
    # schedule '0 0 8 * * *', \prompt-standup
    # schedule '0 0 12 * * *', \remind-about-standup

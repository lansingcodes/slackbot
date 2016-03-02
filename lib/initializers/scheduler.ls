CronJob = require('cron').CronJob

module.exports = (robot) !->

  schedule = (cron-time, module) !->
    run-module = !-> require("../scheduled-tasks/#{module}")(robot)
    new CronJob cron-time, run-module, null, true, 'America/Detroit'

  if process.env.DEBUG?
    schedule '*/10 * * * * *', \check-for-upcoming-events
  else
    schedule '0 0 9 * * *', \check-for-upcoming-events

  schedule '0 0 * * * *', \keep-alive

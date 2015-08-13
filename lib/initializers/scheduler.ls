CronJob = require('cron').CronJob

module.exports = (robot) !->

  schedule = (cron-time, module) !->
    run-module = !-> require("../scheduled-tasks/#{module}")(robot)
    new CronJob cron-time, run-module, null, true, 'America/Detroit'

  schedule '0 0 9 * * *', \check-for-upcoming-events

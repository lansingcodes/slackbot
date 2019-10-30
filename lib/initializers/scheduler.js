// Description:
//   Schedules recurring execution of scripts.
//
// Dependencies:
//   "cron"
//
// Configuration:
//   N/A
//
// Commands:
//   N/A
//
// Notes:
//   N/A
//
// Author:
//   chrisvfritz
//   egillespie
const CronJob = require('cron').CronJob

module.exports = (robot) => {
  /**
   * Schedule a module from '../scheduled-tasks' for execution.
   *
   * All scheduled tasks will be eligible for execution immediately after
   * scheduling. Schedules are hard-coded in the timezone 'America/Detroit'.
   *
   * @param {string} cronTime A cron string which represents the execution
   *   schedule.
   * @param {string} moduleName The name of the module in the directory
   *   '../scheduled-tasks' to be executed when the cron trigger fires. For
   *   example, passing 'check-for-upcoming-events' would cause the scheduler
   *   to load and execute the module default in
   *   '../scheduled-tasks/check-for-upcoming-events.js'.
   */
  const schedule = (cronTime, moduleName) => {
    const runModule = () => require(`../scheduled-tasks/${moduleName}`)(robot)
    new CronJob(cronTime, runModule, null, true, 'America/Detroit')
  }

  if (process.env.DEBUG) {
    schedule('*/10 * * * * *', 'check-for-upcoming-events')
  } else {
    schedule('0 0 9 * * *', 'check-for-upcoming-events')
  }
}

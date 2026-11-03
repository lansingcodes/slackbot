// Verify that notification history is available before the scheduler starts.
const getEventsCacher = require('../cachers/events-cacher')

module.exports = async robot => {
  await getEventsCacher(robot).load()
}

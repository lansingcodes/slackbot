const NOTIFICATIONS_CACHE = 'notifications-cache'

// Get the notifications cache, so that we don't keep notifying about the same
// meetups over and over again
module.exports = (robot) => {
  const notificationsCache = robot.brain.get(NOTIFICATIONS_CACHE) || {}
  return {
    cache (event) {
      notificationsCache[event.id] = true
      robot.brain.set(NOTIFICATIONS_CACHE, notificationsCache)
    },
    alreadyNotifiedRegarding (event) {
      return !!notificationsCache[event.id]
    },
    getAll () {
      return notificationsCache
    },
    clearAll () {
      robot.brain.set(NOTIFICATIONS_CACHE, {})
    }
  }
}

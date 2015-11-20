require! {
  '../fetchers/upcoming-events-fetcher': UpcomingEventsFetcher
}

module.exports = (robot) !->

  robot.respond /identify me/, (message) !->
    console.log JSON.stringify message.envelope.user
    message.send "Just sent some user info to the server logs."

  robot.enter (message) !->
    console.log JSON.stringify message.envelope.user

  robot.respond /silently update notifications cache/, (message) !->
    if message.envelope.user.name is \chrisvfritz
      message.send "Silently updating the notifications cache..."
      new UpcomingEventsFetcher(robot).all (events) !->
        for event in events
          cache-event event

  robot.respond /inspect notifications cache/, (message) !->
    if message.envelope.user.name is \chrisvfritz
      console.log JSON.stringify robot.brain.get \notifications-cache
      message.send "Just printed the cache to the server logs."

  robot.respond /clear notifications cache/, (message) !->
    if message.envelope.user.name is \chrisvfritz
      robot.brain.set \notifications-cache, {}
      message.send "Just cleared the notifications cache."

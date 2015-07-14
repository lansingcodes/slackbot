require! {
  '../src/next-meetup-fetcher': NextMeetupFetcher
  moment
}

CronJob = require('cron').CronJob

const ROOM = \general

is-today = (event) ->
  event-date = new Date(event.time).set-hours 0 0 0 0
  todays-date = new Date().set-hours 0 0 0 0
  event-date is todays-date

formatted-time-only = (event) ->
  event.time
    |> moment
    |> (.format 'h:mma')

module.exports = (robot) !->

  # Get the notifications cache, so that we don't keep notifying about the same
  # meetups over and over again
  notifications-cache = robot.brain.get(\notifications-cache) || {}

  # Checks if we've already notified about this event
  already-notified-regarding = (event) ->
    notifications-cache?[event.group.urlname]?[event.id] is true

  cache-event = (event) !->
    # Update the cache to remember that we've already found this event
    notifications-cache{}[event.group.urlname][event.id] = true
    # Save the updated cache to lubot's persistent brain
    robot.brain.set \notifications-cache, notifications-cache

  check-for-new-meetups = !->
    # We haven't found any new meetups yet
    new-meetups-were-found = false
    # Say goodmorning
    robot.message-room ROOM, "Good morning everyone! Yawn... I'm gonna grab some coffee and check for newly scheduled meetups."
    # Fetch the latest upcoming event for each group that Lansing Codes is
    # following on meetup.com
    new NextMeetupFetcher(robot).all (events) !->
      # For every event...
      for event in events
        # If we've already notified people about this event...
        if is-today event
          # Remember that there was at least one new meetup found
          new-meetups-were-found = true
          # Cache that we announced the event
          cache-event event
          # Announce today's event
          robot.message-room ROOM, "WAHH! Meetup tonight! It's \"#{event.name}\" at #{formatted-time-only event}. Find out more at #{event.event_url}"
        else unless already-notified-regarding event
          # Remember that there was at least one new meetup found
          new-meetups-were-found = true
          # Cache that we announced the event
          cache-event event
          # Announce the new event
          robot.message-room ROOM, "There's a new event scheduled for #{event.group.name}: \"#{event.name}\". Find more details at #{event.event_url}"
      # Unless we told people about new meetups...
      unless new-meetups-were-found
        # Tell people we didn't find any meetups.
        robot.message-room ROOM, "I didn't find any new meetups. This coffee's great though!"

  new CronJob '0 0 9 * * *', check-for-new-meetups, null, true

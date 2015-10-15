require! {
  moment
  '../helpers/organizer-for'
  '../helpers/choose-beverage'
  '../templates/welcome-email'
  '../fetchers/upcoming-events-fetcher': UpcomingEventsFetcher
}

const announcement-room = \general

is-today = (event) ->
  event-date = new Date(event.attributes.time.absolute).set-hours 0 0 0 0
  todays-date = new Date().set-hours 0 0 0 0
  event-date is todays-date

format-time-only = (time) ->
  time
    |> moment
    |> (.format 'h:mma')

module.exports = (robot) !->

  # Get the notifications cache, so that we don't keep notifying about the same
  # meetups over and over again
  notifications-cache = robot.brain.get(\notifications-cache) || {}

  # Checks if we've already notified about this event
  already-notified-regarding = (event) ->
    notifications-cache[event.attributes.id.to-string!] is true

  cache-event = (event) !->
    # Update the cache to remember that we've already found this event
    notifications-cache[event.attributes.id.to-string!] = true
    # Save the updated cache to lubot's persistent brain
    robot.brain.set \notifications-cache, notifications-cache

  # We haven't found any new meetups yet
  events-were-announced = false
  # Say goodmorning
  [beverage-choice, beverage-reaction] = choose-beverage!
  robot.message-room announcement-room, "Good morning everyone! Yawn... I'm gonna grab some #{beverage-choice} and check for newly scheduled meetups."
  # Fetch the latest upcoming event for each group that Lansing Codes is
  # following on meetup.com
  new UpcomingEventsFetcher(robot).all (events) !->
    # For every event...
    for event in events
      # If we've already notified people about this event...
      if is-today event
        # Remember that there was at least one new meetup found
        events-were-announced = true
        # Cache that we announced the event
        cache-event event
        # Announce today's event
        robot.message-room announcement-room, "WAHH! Meetup tonight! It's \"#{event.attributes.name}\" at #{format-time-only event.attributes.time.absolute}. Join #{event.rsvps.yes} others and RSVP at #{event.links.self}"
        # Send a welcome template to the organizer if one exists
        organizer = organizer-for event.relationships.group.attributes
        if organizer?
          welcome-email event, (short-url) !->
            robot.message-room organizer, "One of your meetups is tonight! Time to send out a friendly email. But guess what? I like you. So here's a link that will fill out almost everything for you.\n#{short-url}\nYou're welcome. And I love you. Ugh, that was too strong, wasn't it? Just... you're welcome."
      else unless already-notified-regarding event
        # Remember that there was at least one new meetup found
        events-were-announced = true
        # Cache that we announced the event
        cache-event event
        # Announce the new event
        robot.message-room announcement-room, "There's a new event scheduled for #{event.relationships.group.attributes.name}: \"#{event.attributes.name}\". Find more details at #{event.links.self}"
    # Unless we told people about new meetups...
    unless events-were-announced
      # Tell people we didn't find any meetups.
      robot.message-room announcement-room, "I didn't find any new meetups. #{beverage-reaction}"

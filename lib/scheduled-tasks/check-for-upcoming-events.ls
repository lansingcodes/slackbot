require! {
  moment
  '../helpers/choose-beverage'
  '../helpers/generate-welcome-email-for'
  '../fetchers/upcoming-events-fetcher': UpcomingEventsFetcher
  '../cachers/events-cacher': EventsCacher
}

const announcement-room = \general

const announcement-room-for = (event) ->
  const event-name = event.relationships.group.attributes.name
  {
    'GLASS: Greater Lansing Area for SQL Server': 'devops'
    'Lansing CocoaHeads': 'cocoaheads'
    'Lansing DevOps Meetup': 'devops'
    'Lansing Experience Design': 'user-experience'
    'Lansing Javascript Meetup': 'javascript'
    'Lansing Marketing Hackers': 'marketing'
    'Lansing Tech Demo Night': 'demo-night'
    'Lansing Web Meetup': 'web-design'
    'Mid-Michigan Agile Group': 'agile'
  }[event-name]

const is-today = (event) ->
  const event-date = new Date(event.attributes.time.absolute).set-hours 0 0 0 0
  const todays-date = new Date().set-hours 0 0 0 0
  event-date is todays-date

const is-in-two-days = (event) ->
  const event-date = new Date(event.attributes.time.absolute).set-hours 0 0 0 0
  const todays-date = new Date().set-hours 0 0 0 0
  moment(event-date).subtract(2, 'days').isSame moment(todays-date)

const is-in-a-week = (event) ->
  const event-date = new Date(event.attributes.time.absolute).set-hours 0 0 0 0
  const todays-date = new Date().set-hours 0 0 0 0
  moment(event-date).subtract(1, 'week').isSame moment(todays-date)

const format-time-only = (time) ->
  time
    |> moment
    |> (.format 'h:mma')

module.exports = (robot) !->

  events-cacher = new EventsCacher(robot)

  # We haven't found any new meetups yet
  events-were-announced = false
  # Say goodmorning
  [beverage-choice, beverage-reaction] = choose-beverage!
  robot.message-room announcement-room, "Good morning everyone! Yawn... I'm gonna grab #{beverage-choice.article} #{beverage-choice.name} and check for newly scheduled meetups."
  # Fetch the latest upcoming event for each group that Lansing Codes is
  # following on meetup.com
  new UpcomingEventsFetcher(robot).all (events) !->
    # For every event...
    for event in events

      const local-announcement-room = announcement-room-for event
      if local-announcement-room
        if is-in-two-days event
          robot.message-room do
            local-announcement-room
            "Yo humans. Just two days until <#{event.links.self}|#{event.attributes.name}> at #{format-time-only event.attributes.time.absolute}. Follow the link to learn more and RSVP."
        if is-in-a-week event
          robot.message-room do
            local-announcement-room
            "It's coming. We're one week from <#{event.links.self}|#{event.attributes.name}> at #{format-time-only event.attributes.time.absolute}. Follow the link to learn more and RSVP. :simple_smile:"
        if is-today event
          robot.message-room do
            local-announcement-room
            "WAHH! *Meetup today!* :tada: It's <#{event.links.self}|#{event.attributes.name}> at #{format-time-only event.attributes.time.absolute}. Follow the link to learn more and RSVP."
      # If we've already notified people about this event...
      if is-today event
        # Remember that there was at least one new meetup found
        events-were-announced = true
        # Cache that we announced the event
        events-cacher.cache event
        # Announce today's event
        robot.message-room announcement-room, "WAHH! Meetup today! It's <#{event.links.self}|#{event.attributes.name}> at #{format-time-only event.attributes.time.absolute}. Follow the link to learn more and RSVP."
        # Send a welcome template to the organizer if one exists
        generate-welcome-email-for event, robot
      else unless events-cacher.already-notified-regarding event
        # Remember that there was at least one new meetup found
        events-were-announced = true
        # Cache that we announced the event
        events-cacher.cache event
        # Announce the new event
        robot.message-room announcement-room, "There's a new event scheduled for #{event.relationships.group.attributes.name}: <#{event.links.self}|#{event.attributes.name}>. Follow the link to learn more and RSVP."
    # Unless we told people about new meetups...
    unless events-were-announced
      # Tell people we didn't find any meetups.
      robot.message-room announcement-room, "I didn't find any new meetups. #{beverage-reaction}"

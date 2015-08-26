require! {
  '../helpers/format-time'
  '../helpers/tableize-array'
  '../fetchers/upcoming-events-fetcher': UpcomingEventsFetcher
}

module.exports = (robot) !->

  const upcoming-events-fetcher = new UpcomingEventsFetcher(robot)

  # When you hear someone talking/asking about an upcoming event...
  robot.hear /(?:next|upcoming) (.*) (?:meetup|event)/i, (message) !->
    # Get the type of meetup being searched for
    meetup-type = message.match.1
    # Check for a matching upcoming meetup, then display an appropriate message
    upcoming-events-fetcher.search meetup-type, (events) !->
      if empty events
        message.send "I couldn't find any upcoming events about _#{meetup-type}_. If you think this is a mistake, tell @chrisvfritz."
      else
        event = events.0
        message.send "\"#{event.attributes.name}\" on #{format-time event.attributes.time.absolute}. Learn more and RSVP at #{event.links.self}"

  # When you heare someone talking/asking about upcoming events...
  robot.hear /(?:next|upcoming) (?:meetups|events)/i, (message) !->
    # Fetch the latest upcoming event for each group that Lansing Codes is
    # following on meetup.com
    upcoming-events-fetcher.all (events) !->

      # Turn the events into a list
      list = events
        |> map -> [ "in #{it.attributes.time.relative}" "#{it.relationships.group.attributes.focus}" "\"#{it.attributes.name}\"" ]

      # Display the table
      message.send [
        "Here are the upcoming events (soonest first):"
        "```\n#{tableize-array list}\n```"
        "Enter `next <meetup-focus> event` (e.g. `next javascript event`) for more details on a specific event, including a link to RSVP."
      ].join '\n'

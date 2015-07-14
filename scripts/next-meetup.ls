require! {
  '../src/next-meetup-fetcher': NextMeetupFetcher
  'cli-table': Table
  moment
}

match-aliases = (text) ->
  switch text
  case 'js' then 'javascript'
  case 'rb' then 'ruby'
  default text

formatted-time = (event) ->
  event.time
    |> moment
    |> (.from-now!)

focus-of = (event) ->
  switch event.group.urlname
  case \Lansing-Ruby-Meetup-Group then \Ruby
  case \GLUGnet                   then \.NET
  case \Lansing-Javascript-Meetup then \JavaScript
  case \Mid-Michigan-Agile-Group  then \Agile
  case \Lansing-DevOps-Meetup     then \DevOps
  case \lansingweb                then \Web
  case \MoMoLansing               then \Mobile
  default event.group.name

module.exports = (robot) !->

  # When you hear someone talking/asking about an upcoming event...
  robot.hear /next (.*) (?:meetup|event)/i, (message) !->
    # Get the type of meetup being searched for
    meetup-type = match-aliases message.match.1
    # Check for a matching upcoming meetup, then display an appropriate message
    new NextMeetupFetcher(robot).by-query meetup-type, (result) !->
      message.send result

  # When you heare someone talking/asking about upcoming events...
  robot.hear /(?:next|upcoming) (?:meetups|events)/i, (message) !->
    # Fetch the latest upcoming event for each group that Lansing Codes is
    # following on meetup.com
    new NextMeetupFetcher(robot).all (events) !->
      # Turn the events into a list
      list = events
        |> map -> "• #{formatted-time it} :: #{focus-of it} :: \"#{it.name}\""
        |> (.join '\n')
      # Display the table
      message.send "Here are the upcoming events (soonest first):"
      message.send list
      message.send "Enter `next <meetup-focus> event` (e.g. `next javascript event`) for more details on a specific event, including a link to RSVP."

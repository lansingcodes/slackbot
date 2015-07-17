require! {
  '../../src/next-meetup-fetcher': NextMeetupFetcher
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

transpose = (array) ->
  Object.keys(array[0])
    |> map (column) ->
       array |> map (row) -> row[column]

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
        |> map -> [ "#{formatted-time it}" "#{focus-of it}" "\"#{it.name}\"" ]
      max-column-lengths = list
        |> map ->
          it |> map (.length)
        |> transpose
        |> map maximum
      list = list
        |> map (event) ->
          number-of-spaces = [0 til event.length]
            |> map (i) -> max-column-lengths[i] - event[i].length
          spaces = number-of-spaces |> map ->
            new Array(it)
              |> map -> ' '
              |> (.join '')
          [ event.0 + spaces.0, event.1 + spaces.1, event.2 ].join ' :: '
        |> (.join '\n')
      # Display the table
      message.send "Here are the upcoming events (soonest first):"
      message.send "```\n#{list}\n```"
      message.send "Enter `next <meetup-focus> event` (e.g. `next javascript event`) for more details on a specific event, including a link to RSVP."

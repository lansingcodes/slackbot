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
    |> (.format 'dddd, MMMM Do [at] h:mma')

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
      # Turn the events into a table
      thead = <[ Title Group Date ]>
      tbody = events
        |> sort-by (.time)
        |> map -> [ it.name, it.group.name, formatted-time(it) ]
      table = new Table(head: thead, col-widths: [50 35 37])
        ..push(...tbody)
        .to-string!
      # Display the table
      message.send "Here are the upcoming events (soonest first):"
      message.send "```\n#{table}\n```"
      message.send "Type in \"next <TYPE-OF-MEETUP> event\" for more details and a link to register for a specific event."

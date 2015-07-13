require! {
  '../src/next-meetup-fetcher': NextMeetupFetcher
}

match-aliases = (text) ->
  switch text
  case 'js' then 'javascript'
  case 'rb' then 'ruby'
  default text

module.exports = (robot) !->

  # When you hear someone talking/asking about an upcoming event...
  robot.hear /next (.*) (?:meetup|event)/i, (message) !->
    # Get the type of meetup being searched for
    meetup-type = match-aliases message.match.1
    # Check for a matching upcoming meetup, then display an appropriate message
    new NextMeetupFetcher(robot).by-query meetup-type, (result) !->
      message.send result

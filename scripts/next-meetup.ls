require! moment

KEY = process.env.LUBOT_MEETUP_API_KEY

organizer-for = (group) ->
  {
    'Lansing DevOps Meetup': 'davin'
    'Lansing Ruby Meetup Group': 'atomaka'
    'Lansing JavaScript Meetup': 'leo'
    'Mobile Monday Lansing': 'leo'
  }[group.name]

match-aliases = (text) ->
  switch text
  case 'js' then 'javascript'
  case 'rb' then 'ruby'
  default text

api-results = (body) ->
  body |> JSON.parse |> (.results)

search-groups-by-fields = (groups, fields, text) ->
  field-matches = (group) ->
    group[field].search( new RegExp text, 'i' ) >= 0

  for field in fields
    matching-group = groups |> find field-matches
    return matching-group if matching-group?
  void

organizer-prod-for = (group) ->
  organizer = organizer-for group
  if organizer?
    "Hey @#{organizer}, can you post the next meetup please?"
  else
    ''

formatted-time = (event) ->
  event.time
    |> moment
    |> (.format 'dddd, MMMM Do [at] h:mma')

module.exports = (robot) !->

  fetch-groups = (callback) !->
    robot.http("https://api.meetup.com/2/groups?member_id=189827394&key=#{KEY}")
      .get! (error, response, body) !->
        body
          |> api-results
          |> callback

  fetch-next-group-event = (group, callback) ->
    robot.http("https://api.meetup.com/2/events?group_id=#{group.id}&status=upcoming&page=1&key=#{KEY}")
      .get() (error, response, body) ->
        body
          |> api-results
          |> first
          |> callback

  # When you hear someone talking/asking about an upcoming event...
  robot.hear /next (.*) (?:meetup|event)/i, (message) !->
    # Get the type of meetup being searched for
    meetup-type = match-aliases message.match.1
    # Fetch the groups that Lansing Codes subscribes to on meetup.com
    fetch-groups (groups) !->
      # Check these groups for a potential match
      matching-group = search-groups-by-fields groups, <[ name description ]>, meetup-type
      # If a matching group is found...
      if matching-group?
        # Fetch the first upcoming event for this group
        fetch-next-group-event matching-group, (next-event) !->
          # If an upcoming event exists...
          if next-event?
            # Share details about the event
            message.send "\"#{next-event.name}\" on #{formatted-time next-event}. Find out more at #{next-event.event_url}"
          # Otherwise...
          else
            # Share the bad news and prod the organizer to post something
            message.send "There aren't any upcoming meetups scheduled for #{matching-group.name}. #{organizer-prod-for matching-group}"
      # Otherwise...
      else
        # Share the bad news and prod the script maintainer
        message.send "No matching meetups found. :-( It's possible this script needs to be improved. @chrisvfritz, what do you think?"

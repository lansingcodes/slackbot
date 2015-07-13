moment = require 'moment'

KEY = process.env.LUBOT_MEETUP_API_KEY

module.exports = (robot) ->

  robot.hear /next (.*) (?:meetup|event)/i, (res) ->
    meetupType = switch res.match[1]
      when 'js' then 'javascript'
      when 'rb' then 'ruby'
      else res.match[1]

    robot.http("https://api.meetup.com/2/groups?member_id=189827394&key=#{KEY}")
      .get() (error, response, body) ->
        groups = JSON.parse(body).results

        searchBy = (attributes) ->
          matchingGroups = []
          for attr in attributes
            if matchingGroups.length is 0
              matchingGroups = groups
                .filter (group) -> group[attr].search(new RegExp(meetupType, 'i')) >= 0
            else
              return matchingGroups
          matchingGroups

        matches = searchBy ['name', 'description']
        if matches.length is 0
          res.send 'No matching meetups found. :-('
        else
          robot.http("https://api.meetup.com/2/events?group_id=#{matches[0].id}&status=upcoming&page=1&key=#{KEY}")
            .get() (error, response, body) ->
              meetups = JSON.parse(body).results
              if meetups.length > 0
                meetup = meetups[0]
                res.send "\"#{meetup.name}\" on #{moment(meetup.time).format('dddd, MMMM Do [at] h:mma')}. Find out more at #{meetup.event_url}"
              else
                res.send "There aren't any upcoming meetups scheduled for #{matches[0].name}"

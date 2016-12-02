const cache-name = \standup-participation-cache

module.exports = (robot) !->
  robot.hear /.*/, (message) !->
    if message.envelope.room is \msu-lansing-codes
      const currentHour = new Date!.getHours!
      if currentHour >= 8 and currentHour <= 12
        participation = robot.brain.get(cache-name) or {}
        participation[message.envelope.user.name] = true
        robot.brain.set cache-name, participation

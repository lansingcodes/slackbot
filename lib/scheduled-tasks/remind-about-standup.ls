const participants = <[ chrisvfritz katiemfritz erik.gillespie stuartpearman ]>
const cache-name = \standup-participation-cache

module.exports = (robot) !->
  participation = robot.brain.get(cache-name) or {}
  console.log(participation)
  robot.brain.set cache-name, {}
  const didnt-participate = participants.filter (person) -> !participation[person]
  const katieIndex = didnt-participate.index-of \katiemfritz
  if katieIndex is not -1
    didnt-participate.splice(katieIndex, 1)
    robot.message-room do
      \msu-lansing-codes,
      "@chrisvfritz I don't mean to be a tattle, but @katiemfritz didn't report in for the daily sprint today."
  if didnt-participate.length > 0
    robot.message-room do
      \msu-lansing-codes
      "@katiemfritz I don't mean to be a tattle, but #{didnt-participate.map ('@'+) .join(', ')} didn't report in for the daily sprint today."

// Keep the historical command while using currently reachable HTTPS images.
const squirrels = [
  'https://shipitsquirrel.github.io/images/ship%20it%20squirrel.png',
  'https://i.imgur.com/DPVM1.png',
  'https://d2f8dzk2mhcqts.cloudfront.net/0772_PEW_Roundup/09_Squirrel.jpg',
  'https://www.cybersalt.org/images/funnypictures/s/supersquirrel.jpg'
]

module.exports = (robot) => {
  const regex = process.env.HUBOT_SHIP_EXTRA_SQUIRRELS
    ? /\bship(ping|z|s|ped)?\s*it\b/i
    : /\bship\s*it\b/i
  robot.hear(regex, msg => msg.send(msg.random(squirrels)))
}

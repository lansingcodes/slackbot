// Description:
//   Accept thanks politely.
// Commands:
//   hubot thank[s] [you] - Hubot accepts your thanks
// Based on hubot-thank-you 0.0.3 (MIT); see docs/legacy-command-attribution.md.

const responses = [
  "you're welcome", 'no problem', 'not at all', 'don’t mention it',
  'it’s no bother', 'it’s my pleasure', 'my pleasure', 'it’s all right',
  'it’s nothing', 'think nothing of it', 'sure', 'sure thing'
]

module.exports = robot => {
  robot.respond(/(thank).*/i, msg => msg.send(msg.random(responses)))
}

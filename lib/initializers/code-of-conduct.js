// Description:
//   Share the community Code of Conduct when someone asks for it.
// Configuration:
//   SLACKBOT_CODE_OF_CONDUCT_URL - HTTPS link to the current policy.
//   SLACKBOT_MODERATORS - Optional comma-separated Slack user IDs.
// Commands:
//   slackbot code of conduct - Share the policy link.
//   code of conduct - Share the policy link in a channel.

const defaultUrl = 'https://www.lansing.codes/code-of-conduct/'

function policyUrl () {
  const raw = process.env.SLACKBOT_CODE_OF_CONDUCT_URL || defaultUrl
  if (/[<>|\s]/.test(raw)) throw new Error('SLACKBOT_CODE_OF_CONDUCT_URL must be one HTTPS URL')
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('SLACKBOT_CODE_OF_CONDUCT_URL must be one HTTPS URL')
  }
  return url.href
}

function moderators () {
  const values = (process.env.SLACKBOT_MODERATORS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  return values.map(value => {
    if (/^[UW][A-Z0-9]+$/.test(value)) return `<@${value}>`
    if (/^@?(?:here|channel|everyone)$/i.test(value)) {
      throw new Error('SLACKBOT_MODERATORS cannot include broadcast mentions')
    }
    throw new Error('SLACKBOT_MODERATORS must contain Slack user IDs (U or W prefix)')
  })
}

module.exports = robot => {
  const url = policyUrl()
  const contacts = moderators()
  const lines = [`Our community guidelines: <${url}|Read the policy>.`]
  if (contacts.length) lines.push(`Questions or concerns? Contact ${contacts.join(', ')}.`)
  const reply = message => message.send(lines.join('\n'))

  robot.respond(/(?:code of conduct|community guidelines)\??$/i, reply)
  robot.hear(/^(?:is there (?:a |an )?|where (?:is|can i find) (?:the |our )?|please (?:share|show) (?:the |our )?)?code of conduct\??$/i, reply)
}

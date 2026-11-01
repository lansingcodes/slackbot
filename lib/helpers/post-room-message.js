// The Hubot Slack adapter logs Web API failures without rejecting send().
// Scheduled notifications need the actual result before recording delivery.
class SlackPostRejectedError extends Error {}

module.exports = async (robot, room, text) => {
  const chat = robot.adapter?.client?.web?.chat
  if (!chat?.postMessage) return robot.messageRoom(room, text)

  let result
  try {
    result = await chat.postMessage({
      channel: room,
      text,
      unfurl_links: false,
      unfurl_media: false
    })
  } catch (error) {
    if (error.code === 'slack_webapi_platform_error') {
      throw new SlackPostRejectedError(`Slack rejected a message to ${room}: ${error.data?.error || error.message}`)
    }
    throw error
  }
  if (result?.ok === false) throw new SlackPostRejectedError(`Slack rejected a message to ${room}: ${result.error || 'unknown error'}`)
  return result
}

module.exports.SlackPostRejectedError = SlackPostRejectedError

// Description:
//   Answer event requests when a Slack message is edited into a command.

const { TextMessage } = require('hubot')

const eventRequest = /(?:next|upcoming) (?:meetups|events)\b|(?:next|upcoming) .+ (?:meetup|event)\b/i

module.exports = robot => {
  const socket = robot.adapter.client?.socket
  if (!socket) return

  socket.on('message', async payload => {
    const event = payload.body?.event
    if (event?.subtype !== 'message_changed' || !event.channel) return

    const edited = event.message
    const previous = event.previous_message
    if (!edited?.user || edited.bot_id || typeof edited.text !== 'string' || typeof previous?.text !== 'string') return
    if (!eventRequest.test(edited.text) || eventRequest.test(previous.text)) return

    try {
      const user = { ...robot.brain.userForId(edited.user), room: event.channel }
      await robot.receive(new TextMessage(user, edited.text, edited.ts))
    } catch (error) {
      robot.logger.error(`Could not process edited event request: ${error.message}`)
    }
  })
}

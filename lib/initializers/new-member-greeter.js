// Description:
//   Greet a person once when they join the workspace's welcome channel.
//
// Configuration:
//   MEMBER_GREETING_CHANNEL_ID - Slack channel ID; defaults to #general.
//
// Notes:
//   Uses the persistent notification store so a restart or another channel
//   join does not send the same person another greeting.

const getEventsCacher = require('../cachers/events-cacher')
const postRoomMessage = require('../helpers/post-room-message')

module.exports = (robot) => {
  const notifications = getEventsCacher(robot)

  robot.enter(async (message) => {
    const user = message.envelope.user
    const roomId = user?.room
    if (!user?.id || !roomId || user.is_bot || user.bot_id ||
        user.id === robot.adapter?.self?.user_id) return

    const configuredRoom = process.env.MEMBER_GREETING_CHANNEL_ID
    if (configuredRoom) {
      if (roomId !== configuredRoom) return
    } else {
      let room = roomId
      try {
        room = (await robot.adapter.client?.fetchConversation(roomId))?.name || roomId
      } catch (error) {
        robot.logger.warn(`Could not look up greeting channel ${roomId}: ${error.message}`)
      }
      if (room !== 'general') return
    }

    const teamId = robot.adapter?.self?.team_id || 'workspace'
    const notification = { id: `member-greeting:${teamId}:${user.id}` }
    const greeting = `<@${user.id}> welcome to Lansing Codes! :wave: Please read our ` +
      '<https://www.lansing.codes/code-of-conduct|Code of Conduct>. ' +
      'Ask me for `upcoming events` whenever you want to see what is happening.'

    try {
      await notifications.deliverOnce(notification, () => postRoomMessage(robot, roomId, greeting))
    } catch (error) {
      robot.logger.error(`Could not greet new member ${user.id}: ${error.message}`)
    }
  })
}

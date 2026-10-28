// Description:
//   Notifies a channel's designated welcomer when a new user joins the channel.
//
// Dependencies:
//   N/A
//
// Configuration:
//   N/A
//
// Commands:
//   N/A
//
// Notes:
//   Welcomers for each channel are hard-coded in the script.
//
// Author:
//   chrisvfritz

const welcomerFor = (room) => ({
  general: 'chrisvfritz',
  devops: 'davin',
  ruby: 'atomaka',
  javascript: 'leo',
  mobile: 'leo'
})[room]

module.exports = (robot) => {
  robot.enter(async (message) => {
    const roomId = message.envelope.user.room
    const user = message.envelope.user.name
    const configured = process.env.WELCOMER_BY_CHANNEL
      ? JSON.parse(process.env.WELCOMER_BY_CHANNEL)
      : {}
    let room = roomId
    try {
      room = (await robot.adapter.client?.fetchConversation(roomId))?.name || roomId
    } catch (error) {
      robot.logger.warn(`Could not look up channel ${roomId}: ${error.message}`)
    }
    const welcomer = configured[roomId] || welcomerFor(room)

    if (welcomer) {
      const recipient = robot.brain.usersForFuzzyName(welcomer)[0]?.id ||
        (welcomer.startsWith('U') ? welcomer : `@${welcomer}`)
      await robot.messageRoom(
        recipient,
        `${user} just joined ${room} - just giving you a heads up so they can receive a warm welcome :-)`)
    }
  })
}

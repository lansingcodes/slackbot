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
  robot.enter((message) => {
    const room = message.envelope.user.room
    const user = message.envelope.user.name
    const welcomer = welcomerFor(room)

    if (welcomer) {
      robot.messageRoom(
        `@${welcomer}`,
        `${user} just joined ${room} - just giving you a heads up so they can receive a warm welcome :-)`)
    }
  })
}

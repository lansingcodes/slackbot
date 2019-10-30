// Description:
//   Notifies relevant channels when they've been mentioned in a different
//   channel.
//
// Dependencies:
//   N/A
//
// Configuration:
//   N/A
//
// Commands:
//   #<channel-name> - Notifies the mentioned channel that it's been referenced
//   in another channel.
//
// Notes:
//   N/A
//
// Author:
//   chrisvfritz

module.exports = (robot) => {
  robot.hear(/#([\w\-]+)/, (response) => {
    // TODO: Decouple this from Slack client implementation
    const dataStore = robot.adapter.client.rtm.dataStore
    const mentionedChannelName = response.match[1]
    const mentionedChannel = dataStore.getChannelByName(mentionedChannelName)

    if (mentionedChannel) {
      const currentChannelId = response.envelope.room
      const currentChannel = dataStore.getChannelById(currentChannelId)

      if (mentionedChannel.id !== currentChannel.id) {
        const messageId = response.message.id.replace(/\./g, '')
        robot.messageRoom(
          mentionedChannel.id,
          `This channel was just referenced at: https://lansingcodes.slack.com/archives/${currentChannel.id}/p${messageId}`)
      }
    }
  })
}

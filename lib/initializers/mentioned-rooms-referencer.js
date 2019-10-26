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
//   #<channel-name> - Notifies the given channel that it's been referenced in
//     a different channel.
//
// Notes:
//   N/A
//
// Author:
//   chrisvfritz

module.exports = (robot) => {
  robot.hear(/#([\w\-]+)/, (response) => {
    const dataStore = robot.adapter.client.rtm.dataStore;
    const mentionedChannel = dataStore.getChannelByName(response.match[1]);

    if (mentionedChannel) {
      const currentChannel = dataStore.getChannelById(response.envelope.room);

      if (mentionedChannel.id !== currentChannel.id) {
        const messageId = response.message.id.replace(/\./g, '');
        robot.messageRoom(
          mentionedChannel.id,
          `This channel was just referenced at: https://lansingcodes.slack.com/archives/${currentChannel.name}/p${messageId}`)
      }
    }
  });
};

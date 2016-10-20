module.exports = (robot) !->

  robot.hear /#([\w\-]+)/, (message) !->

    const mentioned-channel = robot.adapter.client.rtm.dataStore.getChannelByName message.match.1

    if mentioned-channel
      const current-channel = robot.adapter.client.rtm.dataStore.getChannelById message.envelope.room

      unless mentioned-channel.id is current-channel.id
        const message-id = message.message.id?replace /\./g, ''
        robot.message-room mentioned-channel.id, "This channel was just referenced at: https://lansingcodes.slack.com/archives/#{current-channel.name}/p#{message-id}"

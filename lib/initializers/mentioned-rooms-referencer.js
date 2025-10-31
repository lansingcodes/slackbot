// Description:
//   Notifies relevant channels when they've been mentioned in a different
//   channel.
//
// Dependencies:
//   Slack adapter must expose a Web API client (e.g. @hubot-friends/hubot-slack)
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

const getWebClient = robot => {
  if (robot && robot.adapter && robot.adapter.client) {
    if (robot.adapter.client.web) return robot.adapter.client.web
    if (robot.adapter.client.webClient) return robot.adapter.client.webClient
  }
  return null
}

const channelCache = new Map()

const fetchChannelByName = async (web, logger, name) => {
  const channelName = name.toLowerCase()
  if (channelCache.has(channelName)) {
    return channelCache.get(channelName)
  }

  let cursor
  do {
    const result = await web.conversations.list({
      exclude_archived: true,
      limit: 1000,
      cursor,
      types: 'public_channel,private_channel'
    })

    const match = (result.channels || []).find(channel => channel.name === channelName)
    if (match) {
      channelCache.set(channelName, match)
      channelCache.set(match.id, match)
      return match
    }

    cursor = result.response_metadata && result.response_metadata.next_cursor
  } while (cursor)

  logger.debug(`No channel named #${channelName} found while resolving mention.`)
  return null
}

const fetchChannelById = async (web, logger, id) => {
  if (!id) return null

  if (channelCache.has(id)) {
    return channelCache.get(id)
  }

  const result = await web.conversations.info({ channel: id })
  if (result && result.channel) {
    channelCache.set(id, result.channel)
    if (result.channel.name) {
      channelCache.set(result.channel.name.toLowerCase(), result.channel)
    }
    return result.channel
  }

  logger.debug(`Unable to load channel metadata for ${id}`)
  return null
}

const buildPermalink = async (web, logger, channelId, messageTs) => {
  if (!channelId || !messageTs) return null

  try {
    const result = await web.chat.getPermalink({
      channel: channelId,
      message_ts: messageTs
    })

    if (result && result.permalink) {
      return result.permalink
    }
  } catch (error) {
    logger.debug(`Falling back to legacy permalink formatter: ${error.message}`)
  }

  const safeTs = String(messageTs).replace(/\./g, '')
  return `https://lansingcodes.slack.com/archives/${channelId}/p${safeTs}`
}

module.exports = robot => {
  const logger = robot.logger || console

  robot.hear(/#([\w-]+)/, response => {
    const web = getWebClient(robot)

    if (!web) {
      logger.warn('Slack web client unavailable; mentioned-rooms-referencer disabled.')
      return
    }

    const mentionedChannelName = response.match[1]
    const currentChannelId = response.envelope && response.envelope.room
    const messageTs = response.message && response.message.id

    Promise.all([
      fetchChannelByName(web, logger, mentionedChannelName),
      fetchChannelById(web, logger, currentChannelId)
    ])
      .then(async ([mentionedChannel, currentChannel]) => {
        if (!mentionedChannel || !currentChannel) return
        if (mentionedChannel.id === currentChannel.id) return

        const permalink = await buildPermalink(web, logger, currentChannel.id, messageTs)

        robot.messageRoom(
          mentionedChannel.id,
          `This channel was just referenced at: ${permalink}`
        )
      })
      .catch(error => {
        logger.error(error, 'Failed to reference mentioned Slack channel')
      })
  })
}

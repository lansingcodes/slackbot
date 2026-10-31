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

module.exports = robot => {
  const channelIds = new Map()

  robot.hear(/#([\w-]+)/, async response => {
    const client = robot.adapter.client
    if (!client || !client.web) return

    const mentionedChannelName = response.match[1]
    const currentChannelId = response.envelope.room
    if (!/^[CG][A-Z0-9]+$/.test(currentChannelId)) return

    const rawMention = response.message.rawText?.match(
      new RegExp(`<#([A-Z0-9]+)\\|${mentionedChannelName}>`)
    )
    let mentionedChannelId = rawMention?.[1] || channelIds.get(mentionedChannelName)

    try {
      if (!mentionedChannelId) {
        let cursor
        do {
          const result = await client.web.conversations.list({
            types: 'public_channel,private_channel',
            limit: 200,
            cursor
          })
          const channel = result.channels?.find(item => item.name === mentionedChannelName)
          if (channel) {
            mentionedChannelId = channel.id
            channelIds.set(mentionedChannelName, channel.id)
            break
          }
          cursor = result.response_metadata?.next_cursor
        } while (cursor)
      }

      const messageId = response.message.id?.replace(/\./g, '')
      if (!mentionedChannelId || mentionedChannelId === currentChannelId || !messageId) return
      const workspaceUrl = robot.adapter.self?.url
      if (!workspaceUrl) {
        robot.logger.error('Could not reference channel: Slack workspace URL is unavailable')
        return
      }

      await robot.messageRoom(
        mentionedChannelId,
        `This channel was just referenced at: ${new URL(`/archives/${currentChannelId}/p${messageId}`, workspaceUrl)}`
      )
    } catch (error) {
      robot.logger.error(`Could not reference #${mentionedChannelName}: ${error.message}`)
    }
  })
}

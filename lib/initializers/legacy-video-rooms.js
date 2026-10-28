const { randomBytes } = require('node:crypto')

function roomName (requested) {
  const cleaned = (requested || '').trim().replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '')
  return cleaned || `LansingCodes-${randomBytes(12).toString('hex')}`
}

module.exports = (robot) => {
  let base = process.env.HUBOT_VIDEO_ROOM_BASE_URL || 'https://meet.jit.si'
  try {
    const parsed = new URL(base)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
      throw new Error('Video room base URL must be HTTPS without credentials or query parameters')
    }
    base = parsed.href.replace(/\/$/, '')
  } catch (error) {
    robot.logger.warn(`Invalid HUBOT_VIDEO_ROOM_BASE_URL: ${error.message}`)
    base = 'https://meet.jit.si'
  }

  // Keep the historical command while replacing the retired appear.in service.
  robot.respond(/(?:appearin|video room)(?:\s+(.+))?$/i, msg => {
    msg.send(`${base}/${roomName(msg.match[1])}`)
  })
}

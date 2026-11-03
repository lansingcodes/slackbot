// Description:
//   Keep the Heroku dyno awake during configured hours.
//
// Dependencies:
//   N/A
//
// Configuration:
//   HUBOT_HEROKU_KEEPALIVE_URL or HEROKU_URL - Required base URL to ping.
//   HUBOT_HEROKU_KEEPALIVE_INTERVAL          - Minutes between pings (default 5).
//   HUBOT_HEROKU_WAKEUP_TIME                 - Start of uptime window (HH:mm, default 06:00).
//   HUBOT_HEROKU_SLEEP_TIME                  - End of uptime window (HH:mm, default 22:00).
//   EXPRESS_USER / EXPRESS_PASSWORD          - Optional basic auth credentials.
//
// Commands:
//   N/A
//
// Notes:
//   Replaces the deprecated hubot-heroku-keepalive external script.
//
// Author:
//   Lansing Codes maintainers

const parseTime = (value, fallback) => {
  const [hours, minutes] = (value || fallback).split(':').map(number => parseInt(number, 10) || 0)
  return { hours: hours % 24, minutes: minutes % 60 }
}

const computeOffsets = (wakeTime, sleepTime) => {
  const wakeMinutes = (wakeTime.hours * 60 + wakeTime.minutes) % (24 * 60)
  const sleepMinutes = (sleepTime.hours * 60 + sleepTime.minutes) % (24 * 60)
  const awakeMinutes = (sleepMinutes - wakeMinutes + 24 * 60) % (24 * 60)

  return { wakeMinutes, awakeMinutes }
}

module.exports = robot => {
  const url = process.env.HUBOT_HEROKU_KEEPALIVE_URL || process.env.HEROKU_URL

  if (!url) {
    robot.logger.warn('heroku-keepalive skipped: HUBOT_HEROKU_KEEPALIVE_URL/HEROKU_URL not set')
    return
  }

  const normalizedUrl = url.endsWith('/') ? url : `${url}/`
  const intervalMinutes = process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL
    ? parseFloat(process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL)
    : 5

  if (Number.isNaN(intervalMinutes) || intervalMinutes < 0) {
    robot.logger.warn(`Invalid HUBOT_HEROKU_KEEPALIVE_INTERVAL provided: ${process.env.HUBOT_HEROKU_KEEPALIVE_INTERVAL}`)
    return
  }

  if (robot.pingIntervalId) {
    clearInterval(robot.pingIntervalId)
  }

  if (intervalMinutes === 0) {
    robot.logger.info('Heroku keepalive disabled (interval set to 0).')
    return
  }

  const wake = parseTime(process.env.HUBOT_HEROKU_WAKEUP_TIME, '6:00')
  const sleep = parseTime(process.env.HUBOT_HEROKU_SLEEP_TIME, '22:00')
  const { wakeMinutes, awakeMinutes } = computeOffsets(wake, sleep)

  const tick = () => {
    const now = new Date()
    const minutesSinceWake = (now.getHours() * 60 + now.getMinutes() - wakeMinutes + 24 * 60) % (24 * 60)
    if (minutesSinceWake >= awakeMinutes) {
      robot.logger.info('Skipping Heroku keepalive ping (outside wake window).')
      return
    }

    robot.logger.info('Sending Heroku keepalive ping')

    const request = robot.http(`${normalizedUrl}heroku/keepalive`)
    if (process.env.EXPRESS_USER && process.env.EXPRESS_PASSWORD) {
      request.auth(process.env.EXPRESS_USER, process.env.EXPRESS_PASSWORD)
    }
    request.post()((error, res, body) => {
      if (error) {
        robot.logger.error(`Heroku keepalive failed: ${error.message}`)
        robot.emit('error', error)
        return
      }

      robot.logger.info(`Heroku keepalive response: ${res && res.statusCode} ${body || ''}`)
    })
  }

  if (intervalMinutes > 0) {
    const intervalMs = intervalMinutes * 60 * 1000
    tick()
    robot.herokuKeepaliveIntervalId = setInterval(tick, intervalMs)
  }

  const handler = (req, res) => {
    res.set('Content-Type', 'text/plain')
    res.send('OK')
  }

  robot.router.post('/heroku/keepalive', handler)
  robot.router.get('/heroku/keepalive', handler)
}

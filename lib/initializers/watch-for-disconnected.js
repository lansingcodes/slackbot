// Description:
//   Reconnect the bot when it gets disconnected from Slack.
//
// Dependencies:
//   N/A
//
// Configuration:
//   SLACKBOT_DISCONNECT_WAIT_TIME - Duration in milliseconds to wait for reconnection before force restarting the client. Hard-coded to 20000
//
// Commands:
//   N/A
//
// Notes:
//   N/A
//
// Author:
//   chrisvfritz
const waitTime = 20000
process.env.SLACKBOT_DISCONNECT_WAIT_TIME = waitTime

module.exports = robot => {
  let timer = null

  const scheduleRestart = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      throw new Error('Force restarting due to disconnect')
    }, waitTime)
  }

  const cancelRestart = () => {
    clearTimeout(timer)
    timer = null
  }

  if (robot.adapter && typeof robot.adapter.on === 'function') {
    robot.adapter.on('disconnected', scheduleRestart)
    robot.adapter.on('connected', cancelRestart)
  }

  const originalInfo = robot.logger && robot.logger.info ? robot.logger.info.bind(robot.logger) : null

  if (originalInfo) {
    const wrappedInfo = (...args) => {
      const message = args.join(' ')
      if (message.includes('Slack client closed, waiting for reconnect')) {
        scheduleRestart()
      }
      if (message.includes('Slack client now connected')) {
        cancelRestart()
      }
      return originalInfo(...args)
    }

    robot.logger.info = wrappedInfo

    robot.on('shutdown', () => {
      if (robot.logger.info === wrappedInfo) {
        robot.logger.info = originalInfo
      }
    })
  }
}

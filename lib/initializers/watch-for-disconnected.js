// Description:
//   Exit when Slack does not reconnect within the configured wait time.
//
// Configuration:
//   SLACKBOT_DISCONNECT_WAIT_TIME - Reconnect grace period in milliseconds (default: 20000).

const configuredWait = Number(process.env.SLACKBOT_DISCONNECT_WAIT_TIME)
const waitTime = Number.isFinite(configuredWait) && configuredWait > 0
  ? configuredWait
  : 20000

module.exports = robot => {
  const socket = robot.adapter.client?.socket
  if (!socket) return

  let timer
  socket.on('close', () => {
    if (socket.shuttingDown) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      robot.logger.error('Slack did not reconnect in time; exiting for restart')
      process.exit(1)
    }, waitTime)
  })
  socket.on('open', () => {
    clearTimeout(timer)
    timer = null
  })
}

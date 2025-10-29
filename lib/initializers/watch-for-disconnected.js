// Description:
//   Reconnect the bot when it gets disconnected from Slack.
//
// Dependencies:
//   None
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
const DEFAULT_WAIT_TIME_MS = 20000
const DISCONNECT_MESSAGE = 'Slack client closed, waiting for reconnect'
const RECONNECTED_MESSAGE = 'Slack client now connected'

const patchedLoggers = new WeakSet()
const loggerState = new WeakMap()

module.exports = robot => {
  const waitTime = Number(process.env.SLACKBOT_DISCONNECT_WAIT_TIME) || DEFAULT_WAIT_TIME_MS
  process.env.SLACKBOT_DISCONNECT_WAIT_TIME = waitTime

  const logger = robot.logger

  if (!loggerState.has(logger)) {
    loggerState.set(logger, { timer: null })
  }

  const state = loggerState.get(logger)

  const clearTimer = () => {
    if (state.timer) {
      clearTimeout(state.timer)
      state.timer = null
    }
  }

  const handleMessage = (message) => {
    if (!message) return

    const text = typeof message === 'string' ? message : message.toString()

    if (text.includes(DISCONNECT_MESSAGE)) {
      clearTimer()

      state.timer = setTimeout(() => {
        throw new Error('Force restarting due to disconnect')
      }, waitTime)

      return
    }

    if (text.includes(RECONNECTED_MESSAGE)) {
      clearTimer()
    }
  }

  const wrapLoggerMethod = (method) => {
    const original = logger[method]
    if (typeof original !== 'function') return

    logger[method] = function wrappedLogger (...args) {
      if (args.length > 0) {
        handleMessage(args[0])
      }

      return original.apply(this, args)
    }
  }

  if (!patchedLoggers.has(logger)) {
    ['log', 'info', 'notice', 'warning', 'error', 'debug'].forEach(wrapLoggerMethod)
    patchedLoggers.add(logger)

    const originalShutdown = robot.shutdown.bind(robot)

    robot.shutdown = (...args) => {
      clearTimer()
      return originalShutdown(...args)
    }
  }
}

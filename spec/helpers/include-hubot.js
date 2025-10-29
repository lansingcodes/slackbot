const Robot = require('hubot/src/robot')
const TextMessage = require('hubot/src/message').TextMessage
const EnterMessage = require('hubot/src/message').EnterMessage

/* global robot */

const createTestLogger = () => {
  const levels = ['debug', 'info', 'notice', 'warning', 'error', 'log']
  const logger = {}

  levels.forEach(level => {
    logger[level] = (...args) => {
      const consoleMethod = level === 'error' ? 'error' : 'log'
      console[consoleMethod](...args)
    }
  })

  return logger
}

module.exports = () => {
  let originalStdoutReadable

  beforeEach((done) => {
    originalStdoutReadable = process.stdout.readable
    process.stdout.readable = false

    // Create new robot, without http, using the mock adapter
    global.robot = new Robot(null, 'mock-adapter', false, 'slackbot')

    // When the robot is connected
    robot.adapter.on('connected', () => {
      robot.logger = createTestLogger()

      // Create a user
      const user = robot.brain.userForId('1', {
        name: 'jasmine',
        room: 'jasmine'
      })

      // Define helper methods for receiving messages
      global.hubotHelpers = {
        receiveMessage: (message) => {
          robot.adapter.receive(new TextMessage(user, message))
        },
        receiveEntrance: (newUser) => {
          robot.adapter.receive(new EnterMessage(newUser))
        }
      }

      done()
    })

    robot.run()
  })

  afterEach(() => {
    process.stdout.readable = originalStdoutReadable
    robot.shutdown()
  })
}

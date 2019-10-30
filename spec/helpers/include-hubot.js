const Robot = require('hubot/src/robot')
const TextMessage = require('hubot/src/message').TextMessage
const EnterMessage = require('hubot/src/message').EnterMessage

module.exports = () => {
  beforeEach((done) => {
    // Create new robot, without http, using the mock adapter
    global.robot = new Robot(null, 'mock-adapter', false, 'slackbot')

    // When the robot is connected
    robot.adapter.on('connected', () => {
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
    robot.shutdown()
  })
}

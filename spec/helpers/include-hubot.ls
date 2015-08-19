require! {
  'hubot/src/robot': Robot
}
TextMessage = require('hubot/src/message').TextMessage
EnterMessage = require('hubot/src/message').EnterMessage

module.exports = !->

  before-each (done) !->
    # Create new robot, without http, using the mock adapter
    global.robot = new Robot null, 'mock-adapter', false, 'lubot'
    # When the robot is connected
    robot.adapter.on 'connected', !->
      # Create a user
      user = robot.brain.userForId '1',
        name: 'jasmine'
        room: 'jasmine'
      # Defined helper-method for receiving messages
      global.hubot-helpers =
        receive-message: (message) !->
          robot.adapter.receive new TextMessage user, message
        receive-entrance: (new-user) !->
          robot.adapter.receive new EnterMessage new-user
      done!
    robot.run!

  after-each !->
    robot.shutdown!

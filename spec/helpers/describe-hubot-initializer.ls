require! {
  'hubot/src/robot': Robot
}
TextMessage = require('hubot/src/message').TextMessage
EnterMessage = require('hubot/src/message').EnterMessage

module.exports = (describe-text, describe-contents) !->

  describe describe-text, !->

    # Create new robot, without http, using the mock adapter
    robot = new Robot null, 'mock-adapter', false, 'lubot'
    # When the robot is connected
    robot.adapter.on 'connected', !->
      # Load the module under test
      require("../../lib/initializers/#{describe-text}")(robot)
      # Create a user
      user = robot.brain.userForId '1',
        name: 'jasmine'
        room: 'jasmine'
      # Defined helper-method for receiving messages
      hubot-helpers =
        receive-message: (message) !->
          robot.adapter.receive new TextMessage user, message
        receive-entrance: (new-user) !->
          robot.adapter.receive new EnterMessage new-user
      describe-contents robot, hubot-helpers
      robot.shutdown!

    robot.run!

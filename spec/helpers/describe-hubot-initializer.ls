require! {
  'hubot/src/robot': Robot
  # 'hubot/src/message':
}
TextMessage = require('hubot/src/message').TextMessage

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
      receive-message = (message) !->
        robot.adapter.receive new TextMessage user, message
      describe-contents(robot, receive-message)
      robot.shutdown!

    robot.run!

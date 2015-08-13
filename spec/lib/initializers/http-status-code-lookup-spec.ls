
# describe-hubot-script 'http-status-code-lookup', !->
#
#   she 'responds when greeted', (done) !->
#
#     adapter.on 'reply', (envelope, strings) !->
#       expect strings[0] .to-match 'arst'
#       done!
#
#     adapter.receive new TextMessage user, 'http 200'

require! {
  path
  'hubot/src/robot': Robot
}
TextMessage = require('hubot/src/message').TextMessage

describe 'http-status-code-lookup', !->
  robot = undefined
  user = undefined
  adapter = undefined

  before-each (done) !->
    # Create new robot, without http, using the mock adapter
    robot := new Robot null, 'mock-adapter', false, 'lubot'
    # When the robot is connected
    robot.adapter.on 'connected', !->
      # Load the module under test
      require('../../../lib/initializers/http-status-code-lookup')(robot)
      # Create a user
      user := robot.brain.userForId '1',
        name: 'jasmine'
        room: '#jasmine'
      # Create a shortcut to the adapter
      adapter := robot.adapter
      done!

    robot.run!

  after-each !->
    robot.shutdown!

  she 'correctly returns the description for the "http 200"', (done) !->

    adapter.on 'send', (envelope, strings) !->
      expect strings.0 .to-match "200 OK\nStandard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action."
      done!

    adapter.receive new TextMessage user, 'http 200'

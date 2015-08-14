describe-hubot-initializer 'http-status-code-lookup', (robot, hubot-helpers) !->

  she 'returns the correct description for "http 200"', (done) !->

    robot.adapter.on 'send', (envelope, strings) !->
      expect strings.0 .to-equal "200 OK\nStandard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action."
      done!

    hubot-helpers.receive-message 'http 200'

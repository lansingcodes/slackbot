describe-hubot-initializer 'mentioned-rooms-referencer', (robot, receive-message) !->

  she 'sends a notification to a room when it is mentioned elsewhere', (done) !->

    robot.adapter.on 'send', (envelope, strings) !->
      expect envelope.room .to-equal 'test'
      expect strings.0 .to-match 'This channel was just referenced at: https://lansingcodes.slack.com/archives/jasmine/pundefined'
      done!

    receive-message 'This is a reference to the #test room.'

describe-hubot-initializer 'mentioned-rooms-referencer', (robot, receive-message) !->

  she 'does NOT send a notification when the current room is mentioned', (done) !->

    message-was-sent = false

    robot.adapter.on 'send', (envelope, strings) !->
      message-was-sent = true

    receive-message 'This is a reference to the #jasmine room.'

    setTimeout !->
      expect message-was-sent .to-be false
      done!
    , 1000

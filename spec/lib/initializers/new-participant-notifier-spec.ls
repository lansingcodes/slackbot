describe 'new-participant-notifier' !->
  include-hubot!

  before-each !->
    require('../../../lib/initializers/new-participant-notifier') robot

  she 'notifies "chrisvfritz" when a new user enters the "general" room', (done) !->

    new-user = robot.brain.userForId '2',
      name: 'new-user'
      room: 'general'

    robot.adapter.on 'send', (envelope, strings) !->
      expect envelope.room .to-equal 'chrisvfritz'
      expect strings.0 .to-equal 'new-user just joined general - just giving you a heads up so they can receive a warm welcome :-)'
      done!

    hubot-helpers.receive-entrance new-user

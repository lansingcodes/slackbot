describe 'watch-for-disconnected' !->
  include-hubot!

  before-each !->
    console.log '\n<HUBOT-STDOUT>'
    require('../../../lib/initializers/watch-for-disconnected') robot
    @wait-time = parse-int process.env.LUBOT_DISCONNECT_WAIT_TIME
    jasmine.clock!.install!

  after-each !->
    console.log '</HUBOT-STDOUT>'
    jasmine.clock!.uninstall!

  she 'does NOT start a timer without a match' !->

    expect !~>
      robot.logger.info 'Some message that we should not trigger on'
      jasmine.clock!.tick @wait-time + 1
    .not.to-throw!

  she 'starts a timer when a disconnect is detected' !->

    expect !~>
      robot.logger.info 'Slack client closed, waiting for reconnect'
      jasmine.clock!.tick @wait-time + 1
    .to-throw new Error 'Force restarting due to disconnect'

  she 'cancels a timer that has been started if the client reconnects' !->

    expect !~>
      robot.logger.info 'Slack client closed, waiting for reconnect'
      robot.logger.info 'Slack client now connected'
      jasmine.clock!.tick @wait-time + 1
    .not.to-throw!

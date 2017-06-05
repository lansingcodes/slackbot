describe 'scheduler' !->
  include-hubot!

  she 'runs without errors', !->
    expect !->
      require('../../../lib/initializers/scheduler') robot
    .not.to-throw!

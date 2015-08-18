require! '../../../lib/helpers/choose-beverage'

describe 'choose-beverage' !->

  before-each !->
    [@beverage-choice, @beverage-reaction] = choose-beverage!

  she 'should return a defined beverage choice' !->
    expect @beverage-choice .to-be-defined!

  she 'should return a defined beverage reaction' !->
    expect @beverage-reaction .to-be-defined!

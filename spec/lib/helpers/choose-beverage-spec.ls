require! '../../../lib/helpers/choose-beverage'

describe 'choose-beverage' (_) !->

  beverage-choice = undefined
  beverage-reaction = undefined

  before-each !->
    [beverage-choice, beverage-reaction] := choose-beverage!

  it 'should return a defined beverage choice' !->
    expect beverage-choice .to-be-defined!

  it 'should return a defined beverage reaction' !->
    expect beverage-reaction .to-be-defined!

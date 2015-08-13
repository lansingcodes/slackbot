const beverage-options = [ 'coffee' 'Earl Grey' 'grapefruit juice' 'orange juice' 'apple juice' ]
const beverage-reactions = [
  "This {beverage}'s great though!"
  "And someone drank the last of the {beverage}! It was one of you, wasn't it?!"
  "And this {beverage} tastes kind of tangy. I don't think it's supposed to be this tangy."
]

sample = (array) ->
  array[ Math.floor( Math.random() * array.length ) ]

reaction-to = (beverage) ->
  beverage-reactions
    |> sample
    |> (.replace /\{beverage\}/g, beverage)

module.exports = ->
  beverage-choice = sample beverage-options
  [ beverage-choice, reaction-to(beverage-choice) ]

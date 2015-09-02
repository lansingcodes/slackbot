const beverage-options = [ 
  "apple juice"
  "bloody mary"
  "coffee"
  "cranberry juice"
  "earl grey"
  "grapefruit juice"
  "green tea"
  "grog"
  "Irish coffee"
  "mimosa"
  "milk"
  "orange juice"
  "pomegranate juice"
  "protein shake"
  "red bull"
  "starbucks"
  "smoothie"
]

const beverage-reactions = [
  "This {beverage}'s great though!"
  "And someone drank the last of the {beverage}! It was one of you, wasn't it?!"
  "And this {beverage} tastes kind of tangy. I don't think it's supposed to be this tangy."
  "Who else wants some of this {beverage}, it's not my first choice but who can say no to {beverage}."
  "Oh yuck, when did I open this? The {beverage} must have gone bad."
  "Who made this {beverage}? If it was you, then please make a couple more!"
  "Does anyone want to join me for some {beverage}? It is delicious."
  "Wait... Is this {beverage} supposed to be hot? It's pretty cold."
  "Ah, how refreshing. Does anyone else want a {beverage}?"
  "Yuck, does anyone else want my {beverage}? It doesn't taste quite right."
  "This {beverage} needs something... maybe sugar?"
  "Mmm, {beverage], so refreshing!"
  "Aww not again, who put a fly in my {beverage}?"
  "Another {beverage}? Someone needs to refresh this menu."
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

const sample = require('./sample')

const beverages = [
  {
    'article': 'an',
    'name': 'apple juice'
  },
  {
    'article': 'a',
    'name': 'bloody mary'
  },
  {
    'article': 'a',
    'name': 'coffee'
  },
  {
    'article': 'some',
    'name': 'cranberry juice'
  },
  {
    'article': 'an',
    'name': 'earl grey'
  },
  {
    'article': 'some',
    'name': 'grapefruit juice'
  },
  {
    'article': 'some',
    'name': 'green tea'
  },
  {
    'article': 'some',
    'name': 'grog'
  },
  {
    'article': 'an',
    'name': 'Irish coffee'
  },
  {
    'article': 'a',
    'name': 'mimosa'
  },
  {
    'article': 'some',
    'name': 'milk'
  },
  {
    'article': 'some',
    'name': 'orange juice'
  },
  {
    'article': 'some',
    'name': 'pomegranate juice'
  },
  {
    'article': 'a',
    'name': 'protein shake'
  },
  {
    'article': 'some',
    'name': 'red bull'
  },
  {
    'article': 'a',
    'name': 'smoothie'
  },
  {
    'article': 'a',
    'name': 'mountain dew'
  },
  {
    'article': 'some',
    'name': 'hot chocolate'
  },
  {
    'article': 'some',
    'name': 'lemonade'
  },
  {
    'article': 'a',
    'name': 'faygo orange pop'
  },
  {
    'article': 'some',
    'name': 'gin & tonic'
  },
  {
    'article': 'some',
    'name': 'hot apple cider'
  },
  {
    'article': 'a',
    'name': 'vanilla milkshake'
  },
  {
    'article': 'some',
    'name': 'blackberry mead'
  },
  {
    'article': 'a',
    'name': 'slurpee'
  },
  {
    'article': 'some',
    'name': 'coconut milk'
  }
]

const reactions = [
  'This {beverage.name}\'s great though!',
  'And someone drank the last of my {beverage.name}! It was one of you, wasn\'t it?!',
  'And this {beverage.name} tastes kind of tangy. I don\'t think it\'s supposed to be this tangy.',
  'Who else wants some of this {beverage.name}? It\'s not my first choice but who can say no to {beverage.article} {beverage.name}?',
  'Oh yuck, when did I open this? This {beverage.name} must have gone bad.',
  'Who made this {beverage.name}? If it was you, then please make a couple more!',
  'Does anyone want to join me for {beverage.article} {beverage.name}? It is delicious.',
  'Wait... I usually drink my {beverage.name} with a little umbrella. There\'s... there\'s no... umbrella today. :-(',
  'Ah, how refreshing. Does anyone else want {beverage.article} {beverage.name}?',
  'Yuck, does anyone else want my {beverage.name}? It doesn\'t taste quite right.',
  'This {beverage.name} needs something... maybe sugar?',
  'Aww, not again! Who put a fly in my {beverage.name}?',
  'Another {beverage.name}? Someone needs to refresh this menu.'
]

const reactionTo = (beverage) =>
  sample(reactions)
    .replace(/\{beverage.name\}/g, beverage.name)
    .replace(/\{beverage.article\}/g, beverage.article)

module.exports = () => {
  const beverage = sample(beverages)
  return [beverage, reactionTo(beverage)]
}

const sample = require('./sample')

const snacks = [
  { article: 'a', name: 'donut' },
  { article: 'a', name: 'glazed donut' },
  { article: 'a', name: 'bagel' },
  { article: 'an', name: 'everything bagel' },
  { article: 'a', name: 'pastry' },
  { article: 'a', name: 'cinnamon pastry' },
  { article: 'a', name: 'chocolate cupcake' },
  { article: 'a', name: 'cupcake' }
]

const reactions = [
  'This {snack.name} is just what I needed. Anyone else want one?',
  'Who left this {snack.name} here? I may have to investigate.',
  'I found crumbs from {snack.article} {snack.name}. The mystery continues.',
  'There might be one more {snack.name} in the box. No promises.'
]

module.exports = () => {
  const snack = sample(snacks)
  const reaction = sample(reactions)
    .replace(/\{snack.name\}/g, snack.name)
    .replace(/\{snack.article\}/g, snack.article)
  return [snack, reaction]
}

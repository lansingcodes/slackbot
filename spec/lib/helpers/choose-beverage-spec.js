const chooseBeverage = require('../../../lib/helpers/choose-beverage')
const proxyquire = require('proxyquire')

describe('choose-beverage', () => {
  let beverageChoice
  let beverageReaction

  beforeEach(() => {
    [beverageChoice, beverageReaction] = chooseBeverage()
  })

  afterEach(() => {
    beverageChoice = undefined
    beverageReaction = undefined
  })

  it('should return a defined beverage choice', () => {
    expect(beverageChoice).toBeDefined()
  })

  it('should return a defined beverage reaction', () => {
    expect(beverageReaction).toBeDefined()
  })

  it('includes a latte without changing drink reactions', () => {
    const chooseLatte = proxyquire('../../../lib/helpers/choose-beverage', {
      './sample': items => typeof items[0] === 'string'
        ? items[0]
        : items.find(item => item.name === 'latte')
    })
    const [latte, reaction] = chooseLatte()
    expect(latte).toEqual({ article: 'a', name: 'latte' })
    expect(reaction).toContain('latte')
  })
})

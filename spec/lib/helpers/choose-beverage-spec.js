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

  it('offers seasonal drinks only during their selected UTC months', () => {
    const availableOn = date => {
      let available
      const choose = proxyquire('../../../lib/helpers/choose-beverage', {
        './sample': items => {
          if (typeof items[0] === 'string') return items[0]
          available = items
          return items[0]
        }
      })
      choose(new Date(date))
      return available.map(item => item.name)
    }

    expect(availableOn('2026-10-15T12:00:00Z')).toContain('pumpkin spice latte')
    expect(availableOn('2026-10-15T12:00:00Z')).not.toContain('peppermint mocha')
    expect(availableOn('2026-01-15T12:00:00Z')).toContain('peppermint mocha')
    expect(availableOn('2026-07-15T12:00:00Z')).toContain('strawberry lemonade')
    expect(availableOn('2026-04-15T12:00:00Z')).not.toContain('strawberry lemonade')
  })
})

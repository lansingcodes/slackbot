const chooseBeverage = require('../../../lib/helpers/choose-beverage')

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
})

const proxyquire = require('proxyquire')

describe('choose-snack', () => {
  it('pairs each snack with a snack reaction rather than a drink reaction', () => {
    const snacks = [
      ['a', 'donut'], ['a', 'glazed donut'],
      ['a', 'bagel'], ['an', 'everything bagel'],
      ['a', 'pastry'], ['a', 'cinnamon pastry'],
      ['a', 'chocolate cupcake'], ['a', 'cupcake']
    ]
    snacks.forEach(([article, name], index) => {
      const chooseSnack = proxyquire('../../../lib/helpers/choose-snack', {
        './sample': items => items[index % items.length]
      })
      const [snack, reaction] = chooseSnack()
      expect(snack).toEqual({ article, name })
      expect(reaction).toContain(name)
      expect(reaction).not.toMatch(/drink|drank|sip|taste/i)
      expect(reaction).not.toContain('{snack.name}')
      expect(reaction).not.toContain('{snack.article}')
    })
  })

  it('uses the right article for an everything bagel', () => {
    let call = 0
    const chooseSnack = proxyquire('../../../lib/helpers/choose-snack', {
      './sample': items => items[call++ === 0 ? 3 : 2]
    })
    const [snack, reaction] = chooseSnack()
    expect(snack.name).toBe('everything bagel')
    expect(reaction).toContain('an everything bagel')
  })
})

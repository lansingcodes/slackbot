const registerDarts = require('../../../lib/initializers/legacy-darts')

describe('legacy dart command', () => {
  it('accepts an uppercase target without passing an undefined hit list to random', () => {
    let command
    let pattern
    const robot = {
      respond: (registeredPattern, handler) => { pattern = registeredPattern; command = handler },
      brain: { usersForFuzzyName: () => [{ name: 'Casey' }] }
    }
    registerDarts(robot)
    const message = {
      match: 'shoot Casey in the BODY'.match(pattern),
      reply: jasmine.createSpy('reply'),
      emote: jasmine.createSpy('emote'),
      random: choices => {
        expect(Array.isArray(choices)).toBe(true)
        return choices[0]
      }
    }

    command(message)

    expect(message.emote).toHaveBeenCalledWith(jasmine.stringMatching(/Casey's body.*Casey's shoulder/))
  })
})

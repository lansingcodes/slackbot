const includeHubot = require('../../helpers/include-hubot')

describe('scheduler', () => {
  includeHubot()

  it('runs without errors', () => {
    expect(() => {
      require('../../../lib/initializers/scheduler')(robot)
    }).not.toThrow()
  })
})

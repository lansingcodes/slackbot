const organizerFor = require('../../../lib/helpers/organizer-for')

const supportedGroups = [
  { name: 'demo-night' },
  { name: 'javascript' }
]

describe('organizer-for', () => {
  it('should not return `undefined` for supported groups', () => {
    supportedGroups.forEach(group => {
      expect(organizerFor(group)).toBeDefined()
    })
  })
})

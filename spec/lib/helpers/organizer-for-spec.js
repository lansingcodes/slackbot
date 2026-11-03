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

  it('accepts event group keys and configured Slack user IDs', () => {
    process.env.ORGANIZER_BY_GROUP = '{"catech":"U123"}'
    try {
      expect(organizerFor('javascript')).toBe('erik.gillespie')
      expect(organizerFor('catech')).toBe('U123')
    } finally {
      delete process.env.ORGANIZER_BY_GROUP
    }
  })
})

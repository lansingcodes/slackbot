const memberAliasFor = require('../../../lib/helpers/member-alias-for')

const supportedGroups = [
  { name: 'Lansing DevOps Meetup' },
  { name: 'Lansing Ruby Meetup Group' },
  { name: 'Lansing Javascript Meetup' },
  { name: 'Mobile Monday Lansing' }
]

describe('member-alias-for', () => {
  it('should not return `undefined` for supported groups', () => {
    supportedGroups.forEach(group => {
      expect(memberAliasFor(group)).toBeDefined()
    })
  })
})

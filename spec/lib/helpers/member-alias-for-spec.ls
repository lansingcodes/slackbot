require! '../../../lib/helpers/member-alias-for'

const supported-groups = [
  { name: 'Lansing DevOps Meetup'     }
  { name: 'Lansing Ruby Meetup Group' }
  { name: 'Lansing Javascript Meetup' }
  { name: 'Mobile Monday Lansing'     }
]

describe 'member-alias-for' (_) !->
  she 'should not return `undefined` for supported groups' !->
    for group in supported-groups
      expect member-alias-for(group) .to-be-defined!

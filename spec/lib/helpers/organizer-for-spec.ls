require! '../../../lib/helpers/organizer-for'

const supported-groups = [
  { name: 'Lansing DevOps Meetup'     }
  { name: 'Lansing Ruby Meetup Group' }
  { name: 'Lansing Javascript Meetup' }
  { name: 'Mobile Monday Lansing'     }
]

describe 'organizer-for' !->
  she 'should not return `undefined` for supported groups' !->
    for group in supported-groups
      expect organizer-for(group) .to-be-defined!

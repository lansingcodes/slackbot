require! '../../../lib/helpers/organizer-for'

const supported-groups = [
  { name: 'Lansing DevOps Meetup' }
  { name: 'Lansing Tech Demo Night' }
  { name: 'Lansing Javascript Meetup' }
  { name: 'Lansing Experience Design' }
]

describe 'organizer-for' !->
  she 'should not return `undefined` for supported groups' !->
    for group in supported-groups
      expect organizer-for(group) .to-be-defined!

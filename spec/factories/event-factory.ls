base-event =
  links:
    self: 'http://www.meetup.com/Lansing-Javascript-Meetup/events/222664930/'
  attributes:
    id: '222664930'
    name: 'JavaScript Hack Night'
    description: '<p>Everyone with projects/passions to share will have up to 5 minutes to talk about what\'s got them geeked lately (this does not have to be something you have experience with).</p> <p>Then we\'ll break out to enjoy pizza and beer, with great conversations and casual hacking. If the weather\'s nice and the crowd\'s feeling it, we may even migrate to a patio.</p>'
    time:
      absolute: 1439938800000
      relative: '41 minutes'
    capacity: null
    rsvps:
      yes: 10
      maybe: 0
    status: 'upcoming'
  relationships:
    venue:
      attributes:
        name: 'The Technology Innovation Center'
        address: '325 East Grand River Avenue, East Lansing, MI'
        latitude: 42.73457
        longitude: -84.481125
        directions: null
    group:
      attributes:
        name: 'Lansing Javascript Meetup'
        focus: 'JavaScript'
        slug: 'Lansing-Javascript-Meetup'
        members: 'Javascript Developers'

module.exports = (attributes) ->
  ^^base-event <<< attributes

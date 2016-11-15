require! nock

describe 'events-responder' !->
  include-hubot!

  before-each !->
    require('../../../lib/initializers/events-responder') robot

  she 'returns the next glugnet meetup when asked for "next glugnet meetup"' (done) !->

    nock('https://api.lansing.codes/v1')
      .get('/events/upcoming/search/glugnet')
      .reply 200,
        data: [{
          links:
            self: 'http://www.meetup.com/GLUGnet/events/223349762/'
          attributes:
            id: 'qkmgpkytlbbc'
            name: 'GLUGnet Monthly Meeting'
            description: '<p>Topic and Speaker to be announced later</p> <p>Â </p>'
            time:
              absolute: 1440108000000
              relative: '1 day'
            capacity: null
            rsvps:
              yes: 6
              maybe: 0
            status: 'upcoming'
          relationships:
            venue:
              type: 'venues'
              id: 6643322
            group:
              type: 'groups'
              id: 16552902
        }]
        included:
          venues:
            '6643322':
              attributes:
                name: 'TechSmith Corporation'
                address: '2405 Woodlake Drive, Okemos, MI'
                latitude: 42.680878
                longitude: -84.437927
                directions: null
          groups:
            '16552902':
              attributes:
                name: 'GLUGnet User Group for .NET, Web, Mobile, Database'
                focus: '.NET'
                slug: 'GLUGnet'
                members: 'Developers'

    robot.adapter.on 'send', (envelope, strings) !->
      expect strings.0 .to-equal '<http://www.meetup.com/GLUGnet/events/223349762/|GLUGnet Monthly Meeting> on Thursday, August 20th at 6:00pm. Follow the link to learn more and RSVP.'
      done!

    hubot-helpers.receive-message 'next glugnet meetup'

  she 'returns a table of upcoming meetups when asked for "upcoming events"' (done) !->

    nock('https://api.lansing.codes/v1')
      .get('/events/upcoming/list')
      .reply 200,
        data: [{
          links:
            self: 'http://www.meetup.com/GLUGnet/events/223349762/'
          attributes:
            id: 'qkmgpkytlbbc'
            name: 'GLUGnet Monthly Meeting'
            description: '<p>Topic and Speaker to be announced later</p> <p>Â </p>'
            time:
              absolute: 1440108000000
              relative: '1 day'
            capacity: null
            rsvps:
              yes: 6
              maybe: 0
            status: 'upcoming'
          relationships:
            venue:
              type: 'venues'
              id: 6643322
            group:
              type: 'groups'
              id: 16552902
        }]
        included:
          venues:
            '6643322':
              attributes:
                name: 'TechSmith Corporation'
                address: '2405 Woodlake Drive, Okemos, MI'
                latitude: 42.680878
                longitude: -84.437927
                directions: null
          groups:
            '16552902':
              attributes:
                name: 'GLUGnet User Group for .NET, Web, Mobile, Database'
                focus: '.NET'
                slug: 'GLUGnet'
                members: 'Developers'

    robot.adapter.on 'send', (envelope, strings) !->
      expect strings.0 .to-match /Here are the upcoming events \(soonest first\):\n```\n/
      expect strings.0 .to-match /\n```\nEnter `next <meetup-focus> event` \(e\.g\. `next javascript event`\) for more details on a specific event, including a link to RSVP\./
      done!

    hubot-helpers.receive-message 'upcoming events'

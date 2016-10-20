describe 'check-for-upcoming-events' !->
  include-hubot!

  describe 'when there is at least 1 new event' !->

    require! nock

    before-each !->
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

    she 'announces the process in the #general channel' (done) !->

      message-count = 0

      robot.adapter.on 'send', (envelope, strings) !->
        message-count += 1
        if message-count is 1
          expect envelope.room .to-equal 'general'
          expect strings.0 .to-match /Good morning everyone! Yawn\.\.\. I'm gonna grab some .+ and check for newly scheduled meetups\./
          done!

      require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

    she 'notifies of the upcoming event' (done) !->

      message-count = 0

      robot.adapter.on 'send', (envelope, strings) !->
        message-count += 1
        if message-count is 2
          expect envelope.room .to-equal 'general'
          expect strings.0 .to-equal "There's a new event scheduled for GLUGnet User Group for .NET, Web, Mobile, Database: <http://www.meetup.com/GLUGnet/events/223349762/|GLUGnet Monthly Meeting>. Follow the link to learn more and RSVP."
          done!

      require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

    # BROKEN - Hubot's redis brain not working in test?
    # she 'will NOT notify regarding the same event twice' (done) !->
    #
    #   jasmine.clock!.install!
    #   message-count = 0
    #
    #   robot.adapter.on 'send', (envelope, strings) !->
    #     message-count += 1
    #     if message-count is 4
    #       expect envelope.room .to-equal 'general'
    #       expect strings.0 .to-match /I didn't find any new meetups\./
    #       jasmine.clock!.uninstall!
    #       done!
    #
    #   for iteration in [0 to 1]
    #     jasmine.clock!.tick iteration * 500
    #     require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

  describe 'when there are NO upcoming events' !->

    nock = undefined
    require! nock

    before-each !->
      nock('https://api.lansing.codes/v1')
        .get('/events/upcoming/list')
        .reply 200,
          data: []
          included: {}

    she 'announces that it could not find any new meetups' (done) !->

      message-count = 0

      robot.adapter.on 'send', (envelope, strings) !->
        message-count += 1
        if message-count is 2
          expect envelope.room .to-equal 'general'
          expect (strings.0) .to-match /I didn't find any new meetups\./
          done!

      require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

  describe 'when there are two events happing today' !->

    nock = undefined
    require! nock

    before-each !->
      nock('https://api.lansing.codes/v1')
        .get('/events/upcoming/list')
        .reply 200,
          data: [
            {
              links:
                self: 'http://www.meetup.com/GLUGnet/events/223349762/'
              attributes:
                id: 'qkmgpkytlbbc'
                name: 'Ruby Thing'
                description: '<p>Topic and Speaker to be announced later</p> <p>Â </p>'
                time:
                  absolute: new Date().set-hours 23 59
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
            }, {
              links:
                self: 'http://www.meetup.com/GLUGnet/events/223349762/'
              attributes:
                id: 'qkmgpkytlbbc'
                name: 'JavaScript Thing'
                description: '<p>Topic and Speaker to be announced later</p> <p>Â </p>'
                time:
                  absolute: new Date().set-hours 23 59
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
                  id: 42938479
            }
          ]
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
                  name: 'Lansing Ruby Meetup Group'
                  focus: 'Ruby'
                  slug: 'GLUGnet'
                  members: 'Developers'
              '42938479':
                attributes:
                  name: 'Lansing Javascript Meetup'
                  focus: 'JavaScript'
                  slug: 'GLUGnet'
                  members: 'Developers'

    she 'sends emails to the appropriate organizers' (done) !->

      done! if process.env.CIRCLECI?

        message-count = 0
        first-organizer-notified = undefined

        robot.adapter.on 'send', (envelope, strings) !->
          message-count += 1
          if message-count is 4
            expect <[ atomaka leo ]> .to-contain envelope.room
            first-organizer-notified := envelope.room
          if message-count is 5
            if first-organizer-notified is 'atomaka'
              expect envelope.room .to-equal 'leo'
            else
              expect envelope.room .to-equal 'atomaka'
            done!

        require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

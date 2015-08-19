require! nock

describe 'check-for-upcoming-events' !->
  include-hubot!

  describe 'when there is at least 1 new event' !->

    before-each !->
      nock('http://api.lansing.codes/v1')
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
          expect strings.0 .to-equal "There's a new event scheduled for GLUGnet User Group for .NET, Web, Mobile, Database: \"GLUGnet Monthly Meeting\". Find more details at http://www.meetup.com/GLUGnet/events/223349762/"
          done!

      require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

    # This is broken.
    # she 'will NOT notify regarding the same event twice' (done) !->
    #
    #   message-count = 0
    #
    #   robot.adapter.on 'send', (envelope, strings) !->
    #     console.log strings.0
    #     message-count += 1
    #     if message-count is 4
    #       expect envelope.room .to-equal 'general'
    #       expect strings.0 .to-match /I didn't find any new meetups\./
    #       done!
    #
    #   for [1 to 2]
    #     require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

  describe 'when there are NO upcoming events' !->

    before-each !->
      nock('http://api.lansing.codes/v1')
        .get('/events/upcoming/list')
        .reply 200,
          data: []
          included: {}

    she 'announces that it could not find any new meetups.' (done) !->

      message-count = 0

      robot.adapter.on 'send', (envelope, strings) !->
        message-count += 1
        if message-count is 2
          expect envelope.room .to-equal 'general'
          expect (strings.0) .to-match /I didn't find any new meetups\./
          done!

      require('../../../lib/scheduled-tasks/check-for-upcoming-events') robot

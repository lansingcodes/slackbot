require! {
  nock
  '../../../lib/fetchers/upcoming-events-fetcher': UpcomingEventsFetcher
}

describe 'upcoming-events-fetcher' !->
  include-hubot!

  describe '.all' !->

    describe 'when there is 1 upcoming event' !->

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

      she 'returns an array of events' (done) !->

        new UpcomingEventsFetcher(robot).all (events) !->
          expect (typeof! events) .to-equal \Array
          done!

  describe '.search' !->

    describe 'when there is a matching upcoming event' !->

      before-each !->
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

      she 'returns an array of events' (done) !->

        new UpcomingEventsFetcher(robot).search 'glugnet', (events) !->
          expect (typeof! events) .to-equal \Array
          done!

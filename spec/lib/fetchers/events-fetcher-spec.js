const includeHubot = require('../../helpers/include-hubot')
const proxyquire = require('proxyquire').noCallThru()

describe('events-fetcher', () => {
  includeHubot()

  describe('.upcoming', () => {
    describe('when there is an upcoming event', () => {
      it('returns an array of events', done => {
        const mockFirestore = require('../../helpers/mock-firestore')
        const getEventsFetcher = proxyquire(
          '../../../lib/fetchers/events-fetcher',
          {
            './init-firestore': () =>
              mockFirestore([
                {
                  id: 'meetup@1',
                  data: () => ({
                    name: "Today's new JavaScript framework",
                    group: 'javascript',
                    description: 'tbd',
                    url: 'meetup.com',
                    venue: 'the moon',
                    address: '1 solar system way',
                    startTime: Date.now() + 3 * 24 * 60 * 60 * 1000
                  })
                }
              ])
          }
        )

        getEventsFetcher(robot)
          .then(eventsFetcher => eventsFetcher.upcoming())
          .then(events => {
            expect(Array.isArray(events)).toBe(true)
            expect(events.length).toEqual(1)
            expect(events[0].id).toEqual('meetup@1')
            expect(events[0].group).toEqual('javascript')
            done()
          })
      })
    })
  })
})

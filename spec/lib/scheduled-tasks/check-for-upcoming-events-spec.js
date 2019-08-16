const proxyquire = require('proxyquire').noCallThru()

describe('check-for-upcoming-events', () => {
  includeHubot()

  describe('when there is at least 1 new event', () => {
    const mockEventsFetcher = require('../../helpers/mock-events-fetcher')
    const checkForUpcomingEvents =
      proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
        '../fetchers/events-fetcher': mockEventsFetcher([{
          id: 'meetup@1',
          name: 'Today\'s new JavaScript framework',
          group: 'javascript',
          description: 'tbd',
          url: 'meetup.com',
          venue: 'the moon',
          address: '1 solar system way',
          startTime: Date.now() + (3 * 24 * 60 * 60 * 1000)
        }])
      })

    it('announces the event in the #general channel', done => {
      let messageCount = 0

      robot.adapter.on('send', (envelope, strings) => {
        messageCount++
        if (messageCount === 1) {
          expect(envelope.room).toEqual('general')
          expect(strings[0])
            .toMatch(/Good morning everyone! Yawn\.\.\. I'm gonna grab .+ and check for newly scheduled meetups\./)
          done()
        }
      })

      checkForUpcomingEvents(robot)
    })

    it('notifies of the upcoming event', done => {
      let messageCount = 0

      robot.adapter.on('send', (envelope, strings) => {
        messageCount++
        if (messageCount === 2) {
          expect(envelope.room).toEqual('general')
          expect(strings[0])
            .toEqual('There\'s a new event scheduled: <meetup.com|Today\'s new JavaScript framework>. Follow the link to learn more and RSVP.')
          done()
        }
      })

      checkForUpcomingEvents(robot)
    })
  })

  describe('when there are NO upcoming events', () => {
    const mockEventsFetcher = require('../../helpers/mock-events-fetcher')
    const checkForUpcomingEvents =
      proxyquire('../../../lib/scheduled-tasks/check-for-upcoming-events', {
        '../fetchers/events-fetcher': mockEventsFetcher([])
      })

    it('announces that it could not find any new meetups', done => {
      let messageCount = 0

      robot.adapter.on('send', (envelope, strings) => {
        messageCount++
        if (messageCount === 2) {
          expect(envelope.room).toEqual('general')
          expect(strings[0]).toMatch(/I didn't find any new meetups\./)
          done()
        }
      })

      checkForUpcomingEvents(robot)
    })
  })
})

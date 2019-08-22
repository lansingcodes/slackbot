const proxyquire = require('proxyquire').noCallThru()

describe('events-responder', () => {
  includeHubot()

  it('returns the next event when asked for "next javascript meetup"', done => {
    const mockEventsFetcher = require('../../helpers/mock-events-fetcher')
    const eventsResponder =
      proxyquire('../../../lib/initializers/events-responder', {
        '../fetchers/events-fetcher': mockEventsFetcher([{
          id: 'meetup@1',
          name: 'Today\'s new JavaScript framework',
          group: 'javascript',
          description: 'tbd',
          url: 'meetup.com',
          venue: 'the moon',
          address: '1 solar system way',
          startTime: 1440108000000
        }])
      })

    eventsResponder(robot)

    robot.adapter.on('send', (envelope, strings) => {
      expect(strings[0]).toEqual(
        '<meetup.com|Today\'s new JavaScript framework>' +
        ' on Thursday, August 20th at 6:00pm.' +
        ' Follow the link to learn more and RSVP.'
      )
      done()
    })

    hubotHelpers.receiveMessage('next javascript meetup')
  })

  it('returns an apologetic message when it cannot find the next group event', done => {
    const mockEventsFetcher = require('../../helpers/mock-events-fetcher')
    const eventsResponder =
      proxyquire('../../../lib/initializers/events-responder', {
        '../fetchers/events-fetcher': mockEventsFetcher([])
      })

    eventsResponder(robot)

    robot.adapter.on('send', (envelope, strings) => {
      expect(strings[0]).toEqual(
        'I couldn\'t find any upcoming events about _javascript_.'
      )
      done()
    })

    hubotHelpers.receiveMessage('next javascript meetup')
  })

  it('returns a table of events when asked for "upcoming events"', done => {
    const mockEventsFetcher = require('../../helpers/mock-events-fetcher')
    const eventsResponder =
      proxyquire('../../../lib/initializers/events-responder', {
        '../fetchers/events-fetcher': mockEventsFetcher([{
          id: 'meetup@1',
          name: 'Today\'s new JavaScript framework',
          group: 'javascript',
          description: 'tbd',
          url: 'meetup.com',
          venue: 'the moon',
          address: '1 solar system way',
          startTime: 1440108000000
        }])
      })

    eventsResponder(robot)

    robot.adapter.on('send', (envelope, strings) => {
      expect(strings[0]).toMatch(/Here are the upcoming events \(soonest first\):\n```\n/)
      expect(strings[0]).toMatch(/\nin [^:]+ :: javascript :: Today's new JavaScript framework\n/)
      expect(strings[0]).toMatch(/\n```\nEnter `next <group> event` \(e\.g\. `next javascript event`\) for more details on a specific event, including a link to RSVP\./)
      done()
    })

    hubotHelpers.receiveMessage('upcoming events')
  })
})

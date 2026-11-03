// Description:
//   Get upcoming event information.
//
// Dependencies:
//   "@firebase/firestore"
//   "moment"
//
// Configuration:
//   N/A
//
// Commands:
//   upcoming events - Get a table of upcoming events by date and group.
//   next <group> event - Get the details of the next event for the given group.
//
// Notes:
//   N/A
//
// Author:
//   egillespie

const formatEventResponse = require('../helpers/format-event-response')
const getEventsFetcher = require('../fetchers/events-fetcher')

module.exports = robot => {
  // When you hear someone talking/asking about an upcoming event...
  robot.hear(/(?:next|upcoming) (.*) (?:meetup|event)/i, message => {
    // Get the type of group being searched for
    const group = message.match[1].trim().toLowerCase()
    // Check for a matching group, then display an appropriate message
    getEventsFetcher(robot)
      .then(eventsFetcher => eventsFetcher.upcoming())
      .then(events => {
        const nextEvent = events.find(event => event.group === group)
        if (nextEvent) {
          message.send({
            text: formatEventResponse.nextEvent(nextEvent),
            unfurl_links: false,
            unfurl_media: false
          })
        } else {
          message.send(
            `I couldn't find any upcoming events about _${group}_.`
          )
        }
      })
      .catch(error => {
        robot.logger.error(`Could not load upcoming events: ${error.message}`)
        message.send('I could not load upcoming events right now.')
      })
  })

  // When you hear someone talking/asking about upcoming events...
  robot.hear(/(?:next|upcoming) (?:meetups|events)/i, message => {
    // Fetch the latest upcoming event for each group
    getEventsFetcher(robot)
      .then(eventsFetcher => eventsFetcher.upcoming())
      .then(events => {
        if (events.length > 0) {
          message.send({
            text: formatEventResponse.upcomingEvents(events),
            unfurl_links: false,
            unfurl_media: false
          })
        } else {
          // Display no upcoming events
          message.send(
            'There aren\'t any upcoming events! I hope someone schedules one soon...'
          )
        }
      })
      .catch(error => {
        robot.logger.error(`Could not load upcoming events: ${error.message}`)
        message.send('I could not load upcoming events right now.')
      })
  })
}

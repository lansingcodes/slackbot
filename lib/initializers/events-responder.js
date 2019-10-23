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
//   erik.gillespie

const formatTime = require('../helpers/format-time');
const formatRelativeTime = require('../helpers/format-relative-time');
const matrixToString = require('../helpers/matrix-to-string');
const getEventsFetcher = require('../fetchers/events-fetcher');

module.exports = robot => {
  // When you hear someone talking/asking about an upcoming event...
  robot.hear(/(?:next|upcoming) (.*) (?:meetup|event)/i, message => {
    // Get the type of group being searched for
    const group = message.match[1];
    // Check for a matching group, then display an appropriate message
    getEventsFetcher(robot)
      .then(eventsFetcher => eventsFetcher.upcoming())
      .then(events => {
        const nextEvent = events.find(event => event.group === group);
        if (nextEvent) {
          message.send(
            `<${nextEvent.url}|${nextEvent.name}>` +
            ` on ${formatTime(nextEvent.startTime)}.` +
            ' Follow the link to learn more and RSVP.'
          );
        } else {
          message.send(
            `I couldn't find any upcoming events about _${group}_.`
          );
        }
      });
  });

  // When you heare someone talking/asking about upcoming events...
  robot.hear(/(?:next|upcoming) (?:meetups|events)/i, message => {
    // Fetch the latest upcoming event for each group
    getEventsFetcher(robot)
      .then(eventsFetcher => eventsFetcher.upcoming())
      .then(events => {
        // Turn the events into a matrix
        const eventMatrix = events.map(event => {
          return [
            `in ${formatRelativeTime(event.startTime)}`,
            `${event.group}`,
            `${event.name}`
          ];
        });

        // Display the table
        message.send(
          [
            'Here are the upcoming events (soonest first):',
            '```',
            `${matrixToString(eventMatrix)}`,
            '```',
            'Enter `next <group> event` (e.g. `next javascript event`) for more details on a specific event, including a link to RSVP.'
          ].join('\n')
        );
      });
  });
};

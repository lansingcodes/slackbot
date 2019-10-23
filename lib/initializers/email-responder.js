// Description:
//   Generates welcome emails for today's events which are organized by the current user.
//
// Dependencies:
//   "@firebase/firestore"
//   "moment"
//   "tinyurl"
//
// Configuration:
//   N/A
//
// Commands:
//   slackbot email - Generates welcome emails for today's events organized by the current user.
//
// Notes:
//   N/A
//
// Author:
//   erik.gillespie

const isToday = require('../helpers/is-today');
const organizerFor = require('../helpers/organizer-for');
const generateWelcomeEmailFor = require('../helpers/generate-welcome-email-for');
const getEventsFetcher = require('../fetchers/events-fetcher');

module.exports = robot => {
  robot.respond(/(?:welcome )?emails?/i, message => {
    getEventsFetcher(robot)
      .then(eventsFetcher => eventsFetcher.upcoming())
      .then(events => {
        const currentUser = message.envelope.user.name;
        events.forEach(event => {
          const organizer = organizerFor(event.group);
          if (currentUser === organizer && isToday(event)) {
              generateWelcomeEmailFor(event, robot);
          }
        });
      });
  });
};

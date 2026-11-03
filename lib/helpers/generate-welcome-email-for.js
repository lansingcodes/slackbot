const organizerFor = require('../helpers/organizer-for')
const welcomeEmail = require('../templates/welcome-email')

module.exports = (event, robot) => {
  const organizer = organizerFor(event.group)
  if (organizer) {
    welcomeEmail(event, shortUrl => {
      const recipient = robot.brain.usersForFuzzyName(organizer)[0]?.id || organizer
      robot.messageRoom(recipient, {
        text: [
          ':email: *Your welcome email draft is ready*',
          'Review the time, location, and wording before sending it to attendees.',
          `<${shortUrl}|Open the Meetup draft>`
        ].join('\n'),
        unfurl_links: false,
        unfurl_media: false
      })
    })
  }
}

const organizerFor = require('../helpers/organizer-for')
const welcomeEmail = require('../templates/welcome-email')

module.exports = (event, robot) => {
  const organizer = organizerFor(event.group)
  if (organizer) {
    welcomeEmail(event, shortUrl => {
      robot.messageRoom(
        `@${organizer} One of your meetups is today!` +
        ' Time to send out a friendly email. But guess what? I like you.' +
        ' So here\'s a link that will fill out almost everything for you.\n' +
        `${shortUrl}`
      )
    })
  }
}

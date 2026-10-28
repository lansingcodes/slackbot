const moment = require('moment')
const chooseBeverage = require('../helpers/choose-beverage')
const getEventsCacher = require('../cachers/events-cacher')
const initEventsFetcher = require('../fetchers/events-fetcher')
const isToday = require('../helpers/is-today')
const generateWelcomeEmailFor = require('../helpers/generate-welcome-email-for')

const announcementRoom = process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID || 'general'

const announcementRoomFor = (event) => {
  const configuredRooms = process.env.EVENT_GROUP_CHANNEL_IDS
    ? JSON.parse(process.env.EVENT_GROUP_CHANNEL_IDS)
    : {}
  return configuredRooms[event.group] || ({
    devops: 'devops',
    'experience-design': 'user-experience',
    'demo-night': 'demo-night',
    glass: 'sql',
    'marketing-hackers': 'marketing',
    misec: 'infosec',
    web: 'web-design',
    jvm: 'java',
    freecodecamp: 'freecodecamp',
    javascript: 'javascript',
    dotnet: 'dotnet',
    'code-retreat': 'coderetreat',
    agile: 'agile',
    'software-testing': 'softwaretesting'
  })[event.group]
}

const isInTwoDays = (event) => {
  const eventDate = new Date(event.startTime).setHours(0, 0, 0, 0)
  const todaysDate = new Date().setHours(0, 0, 0, 0)
  return moment(eventDate).subtract(2, 'days').isSame(moment(todaysDate))
}

const isInAWeek = (event) => {
  const eventDate = new Date(event.startTime).setHours(0, 0, 0, 0)
  const todaysDate = new Date().setHours(0, 0, 0, 0)
  return moment(eventDate).subtract(1, 'week').isSame(moment(todaysDate))
}

const formatTimeOnly = (time) => moment(time).format('h:mma')

module.exports = (robot) => {
  const eventsCacher = getEventsCacher(robot)

  // We haven't found any new meetups yet
  let eventsWereAnnounced = false

  const [beverageChoice, beverageReaction] = chooseBeverage()

  // Fetch the latest upcoming event for each group
  return initEventsFetcher(robot)
    .then(eventsFetcher => eventsFetcher.upcoming())
    .then(events => {
      robot.messageRoom(
        announcementRoom,
        `Good morning everyone! Yawn... I'm gonna grab ${beverageChoice.article} ${beverageChoice.name} and check for newly scheduled meetups.`
      )
      events.forEach(event => {
        const localAnnouncementRoom = announcementRoomFor(event)
        const eventTime = formatTimeOnly(event.startTime)
        const notification = stage => ({ id: `${stage}:${event.id}` })

        if (localAnnouncementRoom) {
          if (isInTwoDays(event) && !eventsCacher.alreadyNotifiedRegarding(notification('local-two-days'))) {
            robot.messageRoom(
              localAnnouncementRoom,
              `Yo humans. Just two days until <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
            eventsCacher.cache(notification('local-two-days'))
          } else if (isInAWeek(event) && !eventsCacher.alreadyNotifiedRegarding(notification('local-week'))) {
            robot.messageRoom(
              localAnnouncementRoom,
              `It's coming. We're one week from <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP. :simple_smile:`
            )
            eventsCacher.cache(notification('local-week'))
          } else if (isToday(event) && !eventsCacher.alreadyNotifiedRegarding(notification('local-today'))) {
            robot.messageRoom(
              localAnnouncementRoom,
              `WAHH! *Meetup today!* :tada: It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
            eventsCacher.cache(notification('local-today'))
          }
        }
        // If we've already notified people about this event...
        if (isToday(event) && !eventsCacher.alreadyNotifiedRegarding(notification('general-today'))) {
          // Remember that there was at least one new meetup found
          eventsWereAnnounced = true
          // Cache that we announced the event
          eventsCacher.cache(notification('general-today'))
          eventsCacher.cache(event)
          // Announce today's event
          robot.messageRoom(
            announcementRoom,
            `WAHH! Meetup today! It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
          )
          // Send a welcome template to the organizer if one exists
          generateWelcomeEmailFor(event, robot)
        } else if (!eventsCacher.alreadyNotifiedRegarding(event)) {
          // Remember that there was at least one new meetup found
          eventsWereAnnounced = true
          // Cache that we announced the event
          eventsCacher.cache(event)
          // Announce the new event
          robot.messageRoom(
            announcementRoom,
            `There's a new event scheduled: <${event.url}|${event.name}>. Follow the link to learn more and RSVP.`
          )
        }
      })

      // Unless we told people about new meetups...
      if (!eventsWereAnnounced) {
        // Tell people we didn't find any meetups.
        robot.messageRoom(
          announcementRoom,
          `I didn't find any new meetups. ${beverageReaction}`
        )
      }
    })
    .catch(error => robot.logger.error(`Could not check upcoming events: ${error.message}`))
}

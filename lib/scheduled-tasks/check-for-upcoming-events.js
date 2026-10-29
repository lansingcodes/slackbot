const moment = require('moment')
const chooseBeverage = require('../helpers/choose-beverage')
const getEventsCacher = require('../cachers/events-cacher')
const initEventsFetcher = require('../fetchers/events-fetcher')
const isToday = require('../helpers/is-today')
const generateWelcomeEmailFor = require('../helpers/generate-welcome-email-for')
const parseJsonConfig = require('../helpers/parse-json-config')
const postRoomMessage = require('../helpers/post-room-message')

const announcementRoom = process.env.EVENT_ANNOUNCEMENT_CHANNEL_ID || 'general'

const announcementRoomFor = (event) => {
  const configuredRooms = process.env.EVENT_GROUP_CHANNEL_IDS
    ? parseJsonConfig('EVENT_GROUP_CHANNEL_IDS', process.env.EVENT_GROUP_CHANNEL_IDS)
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
    .then(async events => {
      await eventsCacher.load()
      await postRoomMessage(robot,
        announcementRoom,
        `Good morning everyone! Yawn... I'm gonna grab ${beverageChoice.article} ${beverageChoice.name} and check for newly scheduled meetups.`
      )
      for (const event of events) {
        const localAnnouncementRoom = announcementRoomFor(event)
        const eventTime = formatTimeOnly(event.startTime)
        const notification = stage => ({ id: `${stage}:${event.id}` })

        if (localAnnouncementRoom) {
          if (isInTwoDays(event) && !eventsCacher.alreadyNotifiedRegarding(notification('local-two-days'))) {
            await postRoomMessage(robot,
              localAnnouncementRoom,
              `Yo humans. Just two days until <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
            await eventsCacher.cache(notification('local-two-days'))
          } else if (isInAWeek(event) && !eventsCacher.alreadyNotifiedRegarding(notification('local-week'))) {
            await postRoomMessage(robot,
              localAnnouncementRoom,
              `It's coming. We're one week from <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP. :simple_smile:`
            )
            await eventsCacher.cache(notification('local-week'))
          } else if (isToday(event) && !eventsCacher.alreadyNotifiedRegarding(notification('local-today'))) {
            await postRoomMessage(robot,
              localAnnouncementRoom,
              `WAHH! *Meetup today!* :tada: It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
            await eventsCacher.cache(notification('local-today'))
          }
        }
        // If we've already notified people about this event...
        if (isToday(event) && !eventsCacher.alreadyNotifiedRegarding(notification('general-today'))) {
          // Remember that there was at least one new meetup found
          eventsWereAnnounced = true
          // Announce today's event
          await postRoomMessage(robot,
            announcementRoom,
            `WAHH! Meetup today! It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
          )
          // Record delivery only after Slack accepts the announcement.
          await eventsCacher.cache(notification('general-today'))
          await eventsCacher.cache(event)
          // Send a welcome template to the organizer if one exists
          generateWelcomeEmailFor(event, robot)
        } else if (!eventsCacher.alreadyNotifiedRegarding(event)) {
          // Remember that there was at least one new meetup found
          eventsWereAnnounced = true
          // Announce the new event
          await postRoomMessage(robot,
            announcementRoom,
            `There's a new event scheduled: <${event.url}|${event.name}>. Follow the link to learn more and RSVP.`
          )
          await eventsCacher.cache(event)
        }
      }

      // Unless we told people about new meetups...
      if (!eventsWereAnnounced) {
        // Tell people we didn't find any meetups.
        await postRoomMessage(robot,
          announcementRoom,
          `I didn't find any new meetups. ${beverageReaction}`
        )
      }
    })
    .catch(error => robot.logger.error(`Could not check upcoming events: ${error.message}`))
}

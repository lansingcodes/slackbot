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
  const announce = (item, room, text, alsoCache = []) => eventsCacher.deliverOnce(
    item,
    () => postRoomMessage(robot, room, text),
    alsoCache
  )

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
          if (isInTwoDays(event)) {
            await announce(notification('local-two-days'),
              localAnnouncementRoom,
              `Yo humans. Just two days until <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
          } else if (isInAWeek(event)) {
            await announce(notification('local-week'),
              localAnnouncementRoom,
              `It's coming. We're one week from <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP. :simple_smile:`
            )
          } else if (isToday(event)) {
            await announce(notification('local-today'),
              localAnnouncementRoom,
              `WAHH! *Meetup today!* :tada: It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
          }
        }
        if (isToday(event)) {
          const sent = await announce(notification('general-today'),
            announcementRoom,
            `WAHH! Meetup today! It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`,
            [event]
          )
          if (sent) {
            eventsWereAnnounced = true
            generateWelcomeEmailFor(event, robot)
          }
        } else {
          const sent = await announce(event,
            announcementRoom,
            `There's a new event scheduled: <${event.url}|${event.name}>. Follow the link to learn more and RSVP.`
          )
          if (sent) eventsWereAnnounced = true
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

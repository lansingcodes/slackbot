const moment = require('moment')
const chooseBeverage = require('../helpers/choose-beverage')
const getEventsCacher = require('../cachers/events-cacher')
const initEventsFetcher = require('../fetchers/events-fetcher')

const announcementRoom = 'general'

const announcementRoomFor = (event) => (
  {
    'devops': 'devops',
    'experience-design': 'user-experience',
    'demo-night': 'demo-night',
    'glass': 'sql',
    'marketing-hackers': 'marketing',
    'misec': 'infosec',
    'web': 'web-design',
    'jvm': 'java',
    'freecodecamp': 'freecodecamp',
    'javascript': 'javascript',
    'dotnet': 'dotnet',
    'code-retreat': 'coderetreat',
    'agile': 'agile',
    'software-testing': 'softwaretesting'
  }[event.id]
)

const isToday = (event) => {
  const eventDate = new Date(event.startTime).setHours(0, 0, 0, 0)
  const todaysDate = new Date().setHours(0, 0, 0, 0)
  return eventDate === todaysDate
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

const formatTimeOnly = (time) => moment.utc(time).format('h:mma')

module.exports = (robot) => {
  const eventsCacher = getEventsCacher(robot)

  // We haven't found any new meetups yet
  let eventsWereAnnounced = false

  // Say goodmorning
  const [beverageChoice, beverageReaction] = chooseBeverage()
  robot.messageRoom(
    announcementRoom,
    `Good morning everyone! Yawn... I'm gonna grab ${beverageChoice.article} ${beverageChoice.name} and check for newly scheduled meetups.`
  )

  // Fetch the latest upcoming event for each group
  initEventsFetcher(robot)
    .then(eventsFetcher => eventsFetcher.upcoming())
    .then(events => {
      events.forEach(event => {
        const localAnnouncementRoom = announcementRoomFor(event)
        const eventTime = formatTimeOnly(event.startTime)

        if (localAnnouncementRoom) {
          if (isInTwoDays(event)) {
            robot.messageRoom(
              localAnnouncementRoom,
              `Yo humans. Just two days until <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
          } else if (isInAWeek(event)) {
            robot.messageRoom(
              localAnnouncementRoom,
              `It's coming. We're one week from <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP. :simple_smile:`
            )
          } else if (isToday(event)) {
            robot.messageRoom(
              localAnnouncementRoom,
              `WAHH! *Meetup today!* :tada: It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
            )
          }
        }
        // If we've already notified people about this event...
        if (isToday(event)) {
          // Remember that there was at least one new meetup found
          eventsWereAnnounced = true
          // Cache that we announced the event
          eventsCacher.cache(event)
          // Announce today's event
          robot.messageRoom(
            announcementRoom,
            `WAHH! Meetup today! It's <${event.url}|${event.name}> at ${eventTime}. Follow the link to learn more and RSVP.`
          )
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
}

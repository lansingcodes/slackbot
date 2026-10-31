const chooseBeverage = require('../helpers/choose-beverage')
const getEventsCacher = require('../cachers/events-cacher')
const initEventsFetcher = require('../fetchers/events-fetcher')
const isToday = require('../helpers/is-today')
const daysUntilInLansing = require('../helpers/days-until-in-lansing')
const formatTimeInLansing = require('../helpers/format-time-in-lansing')
const generateWelcomeEmailFor = require('../helpers/generate-welcome-email-for')

const announcementRoom = 'general'

const announcementRoomFor = (event) => (
  {
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
  }[event.id]
)

const isInTwoDays = (event) => daysUntilInLansing(event.startTime) === 2

const isInAWeek = (event) => daysUntilInLansing(event.startTime) === 7

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
        const eventTime = formatTimeInLansing(event.startTime)

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
}

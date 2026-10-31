// Description:
//   Log debug information to the console.
//
// Dependencies:
//   "@firebase/firestore"
//   "moment"
//
// Configuration:
//   TROUBLESHOOTER_USER_IDS - Comma-separated Slack user IDs allowed to inspect or change notification state.
//
// Commands:
//   hubot identify me - Reply with the current user's Slack ID.
//   hubot silently update notifications cache - Update the event notifications cache. For configured users only.
//   hubot inspect upcoming events - Print the table of upcoming events.
//   hubot inspect notifications cache - Print the event notifications cache. For configured users only.
//   hubot clear notifications cache - Clear the event notifications cache. For configured users only.
//
// Notes:
//   N/A
//
// Author:
//   egillespie

const getEventsFetcher = require('../fetchers/events-fetcher')
const getEventsCacher = require('../cachers/events-cacher')

module.exports = robot => {
  const authorizedIds = new Set((process.env.TROUBLESHOOTER_USER_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(id => /^[UW][A-Z0-9]+$/.test(id)))
  const isAuthorized = message => Boolean(message.envelope.user.id) &&
    authorizedIds.has(message.envelope.user.id)

  robot.respond(/identify me/, message => {
    message.send(`Your Slack user ID is ${message.envelope.user.id}.`)
  })

  robot.enter(message => {
    const { id, room } = message.envelope.user
    console.log(JSON.stringify({ id, room }))
  })

  robot.respond(/silently update notifications cache/, message => {
    if (isAuthorized(message)) {
      message.send('Silently updating the notifications cache...')
      const eventsCacher = getEventsCacher(robot)
      getEventsFetcher(robot)
        .then(eventsFetcher => eventsFetcher.upcoming())
        .then(events => {
          events.forEach(event => eventsCacher.cache(event))
        })
    }
  })

  robot.respond(/inspect upcoming events/, message => {
    if (isAuthorized(message)) {
      message.send('Printing all upcoming events to the server logs...')
      getEventsFetcher(robot)
        .then(eventsFetcher => eventsFetcher.upcoming())
        .then(events => {
          console.log(JSON.stringify(events))
        })
    }
  })

  robot.respond(/inspect notifications cache/, message => {
    if (isAuthorized(message)) {
      console.log(JSON.stringify(getEventsCacher(robot).getAll()))
      message.send('Just printed the cache to the server logs.')
    }
  })

  robot.respond(/clear notifications cache/, message => {
    if (isAuthorized(message)) {
      getEventsCacher(robot).clearAll()
      message.send('Just cleared the notifications cache.')
    }
  })
}

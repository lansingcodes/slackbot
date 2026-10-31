// Description:
//   Log debug information to the console.
//
// Dependencies:
//   "@firebase/firestore"
//   "moment"
//
// Configuration:
//   N/A
//
// Commands:
//   hubot identify me - Print the current user's name.
//   hubot silently update notifications cache - Update the event notifications cache. For 'erik.gillespie' only.
//   hubot inspect upcoming events - Print the table of upcoming events.
//   hubot inspect notifications cache - Print the event notifications cache. For 'erik.gillespie' only.
//   hubot clear notifications cache - Clear the event notifications cache. For 'erik.gillespie' only.
//
// Notes:
//   N/A
//
// Author:
//   egillespie

const getEventsFetcher = require('../fetchers/events-fetcher')
const getEventsCacher = require('../cachers/events-cacher')

module.exports = robot => {
  robot.respond(/identify me/, message => {
    console.log(JSON.stringify(message.envelope.user))
    message.send('Just sent your user info to the server logs.')
  })

  robot.enter(message => {
    console.log(JSON.stringify(message.envelope.user))
  })

  robot.respond(/silently update notifications cache/, async message => {
    if (message.envelope.user.name === 'erik.gillespie') {
      message.send('Silently updating the notifications cache...')
      const eventsCacher = getEventsCacher(robot)
      try {
        await eventsCacher.load()
        const events = await (await getEventsFetcher(robot)).upcoming()
        for (const event of events) await eventsCacher.cache(event)
      } catch (error) {
        robot.logger.error(`Could not update notifications cache: ${error.message}`)
      }
    }
  })

  robot.respond(/inspect upcoming events/, message => {
    if (message.envelope.user.name === 'erik.gillespie') {
      message.send('Printing all upcoming events to the server logs...')
      getEventsFetcher(robot)
        .then(eventsFetcher => eventsFetcher.upcoming())
        .then(events => {
          console.log(JSON.stringify(events))
        })
    }
  })

  robot.respond(/inspect notifications cache/, async message => {
    if (message.envelope.user.name === 'erik.gillespie') {
      try {
        const eventsCacher = getEventsCacher(robot)
        await eventsCacher.load()
        console.log(JSON.stringify(eventsCacher.getAll()))
        message.send('Just printed the cache to the server logs.')
      } catch (error) {
        robot.logger.error(`Could not inspect notifications cache: ${error.message}`)
      }
    }
  })

  robot.respond(/clear notifications cache/, async message => {
    if (message.envelope.user.name === 'erik.gillespie') {
      try {
        await getEventsCacher(robot).clearAll()
        message.send('Just cleared the notifications cache.')
      } catch (error) {
        robot.logger.error(`Could not clear notifications cache: ${error.message}`)
      }
    }
  })
}

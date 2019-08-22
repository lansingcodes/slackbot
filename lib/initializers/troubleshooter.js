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

  robot.respond(/silently update notifications cache/, message => {
    if (message.envelope.user.name === 'erik.gillespie') {
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
    if (message.envelope.user.name === 'erik.gillespie') {
      message.send('Printing all upcoming events to the server logs...')
      getEventsFetcher(robot)
        .then(eventsFetcher => eventsFetcher.upcoming())
        .then(events => {
          console.log(JSON.stringify(events))
        })
    }
  })

  robot.respond(/inspect notifications cache/, message => {
    if (message.envelope.user.name === 'erik.gillespie') {
      console.log(JSON.stringify(getEventsCacher(robot).getAll()))
      message.send('Just printed the cache to the server logs.')
    }
  })

  robot.respond(/clear notifications cache/, message => {
    if (message.envelope.user.name === 'erik.gillespie') {
      getEventsCacher(robot).clearAll()
      message.send('Just cleared the notifications cache.')
    }
  })
}

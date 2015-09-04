module.exports = (robot) !->

  new UpcomingEventsFetcher(robot).all (events) !->
    console.log 'Pinged scheduled meetups API!'

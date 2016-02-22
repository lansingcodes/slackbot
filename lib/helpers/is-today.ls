module.exports = (event) ->
  event-date = new Date(event.attributes.time.absolute).set-hours 0 0 0 0
  todays-date = new Date().set-hours 0 0 0 0
  event-date is todays-date

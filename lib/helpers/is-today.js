const daysUntilInLansing = require('./days-until-in-lansing')

module.exports = (event, now = Date.now()) => daysUntilInLansing(event.startTime, now) === 0

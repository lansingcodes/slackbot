const moment = require('moment')

module.exports = time => moment.duration(time - Date.now()).humanize()

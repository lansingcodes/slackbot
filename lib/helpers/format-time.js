const moment = require('moment')

module.exports = time => moment(time).format('dddd, MMMM Do [at] h:mma')

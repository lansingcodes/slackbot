const initFirestore = require('./init-firestore')
const moment = require('moment')

const weeksAvailable = 4

module.exports = (robot) =>
  initFirestore().then(firestore => ({
    upcoming: () => {
      const startDate = moment().startOf('day')
      const endDate = moment(startDate)
        .add(weeksAvailable - 1, 'weeks')
        .endOf('week')
        .endOf('day')

      return firestore
        .collection('events')
        .where('startTime', '>=', startDate.valueOf())
        .where('startTime', '<=', endDate.valueOf())
        .orderBy('startTime', 'asc')
        .get()
        .then(snapshot => {
          const data = []
          snapshot.forEach(doc => data.push(doc.data()))
          return data
        })
    }
  }))

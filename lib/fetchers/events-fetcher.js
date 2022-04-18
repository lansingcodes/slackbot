const { collection, query, where, orderBy, getDocs } = require('firebase/firestore')
const initFirestore = require('./init-firestore')
const moment = require('moment')

const weeksAvailable = 6

module.exports = (robot) =>
  initFirestore().then(db => ({
    upcoming: () => {
      const startDate = moment().startOf('day')
      const endDate = moment(startDate)
        .add(weeksAvailable - 1, 'weeks')
        .endOf('week')
        .endOf('day')

      const eventQuery = query(
        collection(db, 'events'),
        where('startTime', '>=', startDate.valueOf()),
        where('startTime', '<=', endDate.valueOf()),
        orderBy('startTime', 'asc')
      )

      return getDocs(eventQuery)
        .then(snapshot => {
          const data = []
          snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
          return data
        })
    }
  }))

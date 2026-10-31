const moment = require('moment-timezone')
const proxyquire = require('proxyquire').noCallThru()

describe('events-fetcher', () => {
  it('queries through the end of Saturday in Lansing across a DST change', async () => {
    const originalNow = moment.now
    moment.now = () => Date.parse('2026-10-31T22:00:00Z')
    let clauses
    const getEventsFetcher = proxyquire('../../../lib/fetchers/events-fetcher', {
      './init-firestore': () => Promise.resolve({}),
      'firebase/firestore': {
        collection: () => ({}),
        query: (...args) => args,
        where: (field, operator, value) => ({ field, operator, value }),
        orderBy: () => ({}),
        getDocs: async query => {
          clauses = query
          return { forEach: () => {} }
        }
      }
    })

    try {
      await (await getEventsFetcher({})).upcoming()
      const lower = clauses.find(clause => clause.field === 'startTime' && clause.operator === '>=')
      const upper = clauses.find(clause => clause.field === 'startTime' && clause.operator === '<=')
      expect(lower.value).toEqual(Date.parse('2026-10-31T04:00:00Z'))
      expect(upper.value).toEqual(Date.parse('2026-12-06T04:59:59.999Z'))
      expect(Date.parse('2026-12-06T02:00:00Z')).toBeLessThanOrEqual(upper.value)
    } finally {
      moment.now = originalNow
    }
  })
})

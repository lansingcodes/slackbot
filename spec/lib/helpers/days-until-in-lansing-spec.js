const daysUntilInLansing = require('../../../lib/helpers/days-until-in-lansing')
const formatTimeInLansing = require('../../../lib/helpers/format-time-in-lansing')
const isToday = require('../../../lib/helpers/is-today')

describe('Lansing event dates', () => {
  it('recognizes an evening event as today even when its UTC date is tomorrow', () => {
    const now = Date.parse('2026-11-17T14:00:00Z')
    const eventTime = Date.parse('2026-11-18T01:00:00Z')
    expect(daysUntilInLansing(eventTime, now)).toEqual(0)
    expect(isToday({ startTime: eventTime }, now)).toBeTrue()
  })

  it('counts calendar days across the spring daylight-saving change', () => {
    const now = Date.parse('2027-03-12T14:00:00Z')
    const eventTime = Date.parse('2027-03-14T23:00:00Z')
    expect(daysUntilInLansing(eventTime, now)).toEqual(2)
  })

  it('counts a full week across the autumn daylight-saving change', () => {
    const now = Date.parse('2026-10-30T13:00:00Z')
    const eventTime = Date.parse('2026-11-07T01:00:00Z')
    expect(daysUntilInLansing(eventTime, now)).toEqual(7)
  })

  it('formats reminder times in Lansing across both offsets', () => {
    expect(formatTimeInLansing(Date.parse('2026-11-18T01:00:00Z'))).toEqual('8:00pm')
    expect(formatTimeInLansing(Date.parse('2027-07-20T00:00:00Z'))).toEqual('8:00pm')
  })
})

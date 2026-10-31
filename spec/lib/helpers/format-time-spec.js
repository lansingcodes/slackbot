const formatTime = require('../../../lib/helpers/format-time')

describe('format-time', () => {
  it('formats the existing August fixture in Lansing time', () => {
    expect(formatTime(1439436340000))
      .toEqual('Wednesday, August 12th at 11:25pm')
  })

  it('keeps a late evening event on its Lansing calendar date', () => {
    expect(formatTime(Date.parse('2026-11-18T01:00:00Z')))
      .toEqual('Tuesday, November 17th at 8:00pm')
  })

  it('formats daylight-saving event time in Lansing', () => {
    expect(formatTime(Date.parse('2027-07-20T00:00:00Z')))
      .toEqual('Monday, July 19th at 8:00pm')
  })

  it('formats ordinal day endings and invalid dates', () => {
    expect(formatTime(Date.parse('2027-08-21T16:00:00Z')))
      .toEqual('Saturday, August 21st at 12:00pm')
    expect(formatTime(Date.parse('2027-08-22T16:00:00Z')))
      .toEqual('Sunday, August 22nd at 12:00pm')
    expect(formatTime(Date.parse('2027-08-23T16:00:00Z')))
      .toEqual('Monday, August 23rd at 12:00pm')
    expect(formatTime(NaN)).toEqual('Invalid date')
  })
})

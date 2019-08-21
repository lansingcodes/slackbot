const formatTime = require('../../../lib/helpers/format-time')

describe('format-time', () => {
  it(
    'should properly format 1439436340000 to "Wednesday, July 12th at 11:25pm"',
    () => {
      expect(formatTime(1439436340000))
        .toEqual('Wednesday, August 12th at 11:25pm')
    }
  )
})

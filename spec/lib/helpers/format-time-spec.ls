require! '../../../lib/helpers/format-time'

describe 'format-time' !->
  she 'should properly format 1439436340000 to "Wednesday, July 12th at 11:25pm"' !->
    expect format-time(1439436340000) .to-equal 'Wednesday, August 12th at 11:25pm'

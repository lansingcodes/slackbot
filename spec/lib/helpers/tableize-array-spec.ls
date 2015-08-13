require! '../../../lib/helpers/tableize-array'

describe 'tableize-array' (_) !->

  describe 'when given a two-dimensional array of strings' (_) !->

    array = undefined

    before-each !->
      array := [
        [ 'one' 'two' 'three' ]
        [ 'ay' 'bee' 'cee' ]
      ]

    it 'properly formats them into a table' !->
      expect tableize-array(array) .to-equal 'one :: two :: three\nay  :: bee :: cee  '

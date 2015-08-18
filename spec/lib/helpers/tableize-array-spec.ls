require! '../../../lib/helpers/tableize-array'

describe 'tableize-array' !->
  describe 'when given a two-dimensional array of strings' !->

    before-each !->
      @array = [
        [ 'one' 'two' 'three' ]
        [ 'ay' 'bee' 'cee' ]
      ]

    she 'properly formats them into a table' !->
      expect tableize-array(@array) .to-equal 'one :: two :: three\nay  :: bee :: cee'

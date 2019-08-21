const matrixToString = require('../../../lib/helpers/matrix-to-string')

describe('matrix-to-string', () => {
  describe('when given a two-dimensional array of strings', () => {
    it('properly formats them into a table', () => {
      const matrix = [
        ['one', 'two', 'three'],
        ['ay', 'bee', 'cee']
      ]

      expect(matrixToString(matrix))
        .toEqual('one :: two :: three\nay  :: bee :: cee  ')
    })
  })
})

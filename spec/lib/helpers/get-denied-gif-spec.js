const getDeniedGif = require('../../../lib/helpers/get-denied-gif')

const getGifsUntilDifferent = (previousGif) => {
  const newGif = getDeniedGif()
  if (previousGif != null && previousGif !== newGif) {
    return true
  }
  return getGifsUntilDifferent(newGif)
}

describe('get-denied-gif', () => {
  it('should return a random string', () => {
    expect(typeof getDeniedGif()).toEqual('string')
    expect(getGifsUntilDifferent()).toBe(true)
  })
})

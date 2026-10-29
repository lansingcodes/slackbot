const parseJsonConfig = require('../../../lib/helpers/parse-json-config')

describe('parse-json-config', () => {
  it('names malformed configuration without logging its value', () => {
    expect(() => parseJsonConfig('FIREBASE_WEB_CONFIG', "{apiKey:'secret-value'}"))
      .toThrowError('FIREBASE_WEB_CONFIG must be valid JSON with double-quoted property names and string values')
  })
})

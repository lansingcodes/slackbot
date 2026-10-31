const initFirestore = require('../../../lib/fetchers/init-firestore')

describe('init-firestore', () => {
  it('reports missing configuration without preventing the bot from loading', async () => {
    const original = process.env.FIREBASE_WEB_CONFIG
    delete process.env.FIREBASE_WEB_CONFIG
    try {
      await expectAsync(initFirestore()).toBeRejectedWithError('FIREBASE_WEB_CONFIG is required for event features')
    } finally {
      if (original === undefined) delete process.env.FIREBASE_WEB_CONFIG
      else process.env.FIREBASE_WEB_CONFIG = original
    }
  })

  it('names malformed Firebase configuration without exposing its value', async () => {
    const original = process.env.FIREBASE_WEB_CONFIG
    process.env.FIREBASE_WEB_CONFIG = "{apiKey:'secret-value'}"
    try {
      await expectAsync(initFirestore()).toBeRejectedWithError(
        'FIREBASE_WEB_CONFIG must be valid JSON with double-quoted property names and string values'
      )
    } finally {
      if (original === undefined) delete process.env.FIREBASE_WEB_CONFIG
      else process.env.FIREBASE_WEB_CONFIG = original
    }
  })
})

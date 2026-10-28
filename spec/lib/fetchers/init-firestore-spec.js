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
})

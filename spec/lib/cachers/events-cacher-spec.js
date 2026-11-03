const getEventsCacher = require('../../../lib/cachers/events-cacher')

describe('events-cacher', () => {
  it('clears the in-memory cache used for local tests', async () => {
    const previousMode = process.env.NOTIFICATION_STORE
    process.env.NOTIFICATION_STORE = 'memory'
    try {
      const brainState = {}
      const brain = {
        get: key => brainState[key],
        set: (key, value) => { brainState[key] = value }
      }
      const cacher = await getEventsCacher({ brain }).load()
      await cacher.cache({ id: 'event-1' })
      expect(cacher.alreadyNotifiedRegarding({ id: 'event-1' })).toBeTrue()
      await cacher.clearAll()
      expect(cacher.alreadyNotifiedRegarding({ id: 'event-1' })).toBeFalse()
      expect(cacher.getAll()).toEqual({})
    } finally {
      if (previousMode === undefined) delete process.env.NOTIFICATION_STORE
      else process.env.NOTIFICATION_STORE = previousMode
    }
  })

  it('requires Admin credentials outside the emulator', async () => {
    const names = [
      'NOTIFICATION_STORE', 'FIRESTORE_EMULATOR_HOST', 'FIREBASE_SERVICE_ACCOUNT',
      'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'GOOGLE_APPLICATION_CREDENTIALS',
      'FIREBASE_WEB_CONFIG'
    ]
    const previous = Object.fromEntries(names.map(name => [name, process.env[name]]))
    for (const name of names) delete process.env[name]
    process.env.FIREBASE_WEB_CONFIG = JSON.stringify({ projectId: 'demo-lansingcodes' })
    try {
      await expectAsync(getEventsCacher({}).load()).toBeRejectedWithError(/Configure FIREBASE_SERVICE_ACCOUNT/)
    } finally {
      for (const name of names) {
        if (previous[name] === undefined) delete process.env[name]
        else process.env[name] = previous[name]
      }
    }
  })
})

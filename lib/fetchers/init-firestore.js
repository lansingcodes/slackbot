const { initializeApp } = require('firebase/app')
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore')

let db

module.exports = () => {
  if (!process.env.FIREBASE_WEB_CONFIG) {
    return Promise.reject(new Error('FIREBASE_WEB_CONFIG is required for event features'))
  }

  try {
    if (!db) {
      const app = initializeApp(JSON.parse(process.env.FIREBASE_WEB_CONFIG))
      db = getFirestore(app)
      if (process.env.FIRESTORE_EMULATOR_HOST) {
        const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':')
        connectFirestoreEmulator(db, host, Number(port))
      }
    }
    return Promise.resolve(db)
  } catch (error) {
    return Promise.reject(error)
  }
}

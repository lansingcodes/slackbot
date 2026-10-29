const { initializeApp } = require('firebase/app')
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore')
const parseJsonConfig = require('../helpers/parse-json-config')

let db

module.exports = () => {
  if (!process.env.FIREBASE_WEB_CONFIG) {
    return Promise.reject(new Error('FIREBASE_WEB_CONFIG is required for event features'))
  }

  try {
    if (!db) {
      const app = initializeApp(parseJsonConfig('FIREBASE_WEB_CONFIG', process.env.FIREBASE_WEB_CONFIG))
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

const { initializeApp } = require('firebase/app')
const { getFirestore } = require('firebase/firestore')

const firebaseConfig = JSON.parse(process.env.FIREBASE_WEB_CONFIG)
const app = initializeApp(firebaseConfig)

module.exports = () => Promise.resolve(getFirestore(app))

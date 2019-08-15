const { firebase } = require('@firebase/app')
require('@firebase/firestore')

const firebaseConfig = JSON.parse(process.env.FIREBASE_WEB_CONFIG)
const app = firebase.initializeApp(firebaseConfig)

module.exports = () => {
  return Promise.resolve(app.firestore())
}

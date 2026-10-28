const { createHash } = require('node:crypto')
const { initializeApp, getApps, cert, applicationDefault } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const NOTIFICATIONS_CACHE = 'notifications-cache'
const COLLECTION = 'slackbot_notifications'
const APP_NAME = 'slackbot-notifications'

function notificationDb () {
  const existing = getApps().find(app => app.name === APP_NAME)
  if (existing) return getFirestore(existing)

  const webConfig = JSON.parse(process.env.FIREBASE_WEB_CONFIG || '{}')
  const projectId = process.env.FIREBASE_PROJECT_ID || webConfig.projectId
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID or FIREBASE_WEB_CONFIG.projectId is required for notification persistence')

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return getFirestore(initializeApp({ projectId }, APP_NAME))
  }

  let credential
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let serviceAccount
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      credential = cert(serviceAccount)
    } catch (error) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT must be valid service account JSON')
    }
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credential = cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = applicationDefault()
  } else {
    throw new Error('Configure FIREBASE_SERVICE_ACCOUNT or Firebase Admin credentials for notification persistence')
  }

  return getFirestore(initializeApp({ projectId, credential }, APP_NAME))
}

const documentId = key => createHash('sha256').update(key).digest('hex')

module.exports = robot => {
  const memory = process.env.NOTIFICATION_STORE === 'memory'
  let notificationsCache = {}
  let collection

  return {
    async load () {
      if (memory) {
        notificationsCache = { ...(robot.brain.get(NOTIFICATIONS_CACHE) || {}) }
      } else {
        collection = notificationDb().collection(COLLECTION)
        const snapshot = await collection.get()
        notificationsCache = Object.fromEntries(snapshot.docs.map(doc => [doc.data().key, true]))
      }
      return this
    },
    async cache (event) {
      const key = String(event.id)
      if (memory) {
        notificationsCache[key] = true
        robot.brain.set(NOTIFICATIONS_CACHE, notificationsCache)
      } else {
        if (!collection) await this.load()
        await collection.doc(documentId(key)).set({ key, recordedAt: Date.now() })
        notificationsCache[key] = true
      }
    },
    alreadyNotifiedRegarding (event) {
      return !!notificationsCache[String(event.id)]
    },
    getAll () {
      return { ...notificationsCache }
    },
    async clearAll () {
      if (memory) {
        notificationsCache = {}
        robot.brain.set(NOTIFICATIONS_CACHE, notificationsCache)
      } else {
        if (!collection) await this.load()
        await collection.firestore.recursiveDelete(collection)
        notificationsCache = {}
      }
    }
  }
}

const { createHash, randomUUID } = require('node:crypto')
const { initializeApp, getApps, cert, applicationDefault } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const parseJsonConfig = require('../helpers/parse-json-config')
const { SlackPostRejectedError } = require('../helpers/post-room-message')

const NOTIFICATIONS_CACHE = 'notifications-cache'
const COLLECTION = 'slackbot_notifications'
const APP_NAME = 'slackbot-notifications'

function notificationDb () {
  const existing = getApps().find(app => app.name === APP_NAME)
  if (existing) return getFirestore(existing)

  const webConfig = parseJsonConfig('FIREBASE_WEB_CONFIG', process.env.FIREBASE_WEB_CONFIG || '{}')
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
  const inFlight = new Set()

  return {
    async load () {
      if (memory) {
        notificationsCache = { ...(robot.brain.get(NOTIFICATIONS_CACHE) || {}) }
      } else {
        collection = notificationDb().collection(COLLECTION)
        const snapshot = await collection.get()
        notificationsCache = Object.fromEntries(snapshot.docs
          .filter(doc => !doc.data().status || doc.data().status === 'delivered')
          .map(doc => [doc.data().key, true]))
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
    async deliverOnce (event, send, alsoCache = []) {
      const key = String(event.id)
      if (memory) {
        if (notificationsCache[key] || inFlight.has(key)) return false
        inFlight.add(key)
        try {
          await send()
          await this.cache(event)
          for (const item of alsoCache) await this.cache(item)
          return true
        } finally {
          inFlight.delete(key)
        }
      }

      if (!collection) await this.load()
      const db = collection.firestore
      const ref = collection.doc(documentId(key))
      const owner = randomUUID()
      const claim = await db.runTransaction(async transaction => {
        const existing = await transaction.get(ref)
        if (existing.exists) return existing.data().status || 'delivered'
        transaction.create(ref, { key, status: 'pending', owner, claimedAt: Date.now() })
        return 'claimed'
      })
      if (claim !== 'claimed') {
        if (claim !== 'delivered') robot.logger?.warn?.(`Notification ${key} is ${claim}; reconcile its Slack delivery before retrying`)
        return false
      }

      try {
        await send()
      } catch (error) {
        try {
          await db.runTransaction(async transaction => {
            const current = await transaction.get(ref)
            if (current.get('owner') !== owner) return
            if (error instanceof SlackPostRejectedError) transaction.delete(ref)
            else transaction.update(ref, { status: 'uncertain', updatedAt: Date.now() })
          })
        } catch (reconcileError) {
          robot.logger?.error?.(`Could not record failed notification ${key}: ${reconcileError.message}`)
        }
        throw error
      }

      await db.runTransaction(async transaction => {
        const current = await transaction.get(ref)
        if (current.get('owner') !== owner) throw new Error(`Notification claim for ${key} was lost`)
        const recordedAt = Date.now()
        transaction.set(ref, { key, status: 'delivered', recordedAt })
        for (const item of alsoCache) {
          const alias = String(item.id)
          transaction.set(collection.doc(documentId(alias)), { key: alias, status: 'delivered', recordedAt })
        }
      })
      notificationsCache[key] = true
      for (const item of alsoCache) notificationsCache[String(item.id)] = true
      return true
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

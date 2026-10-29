const { options, checkConfiguration } = require('../../dev-tools/deployment-preflight')

describe('deployment preflight guardrails', () => {
  const names = [
    'NOTIFICATION_STORE', 'FIRESTORE_EMULATOR_HOST', 'HUBOT_SLACK_APP_TOKEN',
    'HUBOT_SLACK_BOT_TOKEN', 'FIREBASE_WEB_CONFIG', 'FIREBASE_PROJECT_ID',
    'FIREBASE_SERVICE_ACCOUNT'
  ]
  let previous

  beforeEach(() => {
    previous = Object.fromEntries(names.map(name => [name, process.env[name]]))
    for (const name of names) delete process.env[name]
    process.env.HUBOT_SLACK_APP_TOKEN = 'test-app-token'
    process.env.HUBOT_SLACK_BOT_TOKEN = 'test-bot-token'
    process.env.FIREBASE_WEB_CONFIG = JSON.stringify({ projectId: 'staging-project' })
  })

  afterEach(() => {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name]
      else process.env[name] = previous[name]
    }
  })

  it('requires an explicit project and Slack team', () => {
    expect(() => options(['--expect-project', 'staging-project'])).toThrowError('--expect-team is required')
    expect(() => options(['--expect-team', 'test-team'])).toThrowError('--expect-project is required')
  })

  it('rejects mismatched Firebase reader and writer projects', () => {
    const expected = { project: 'staging-project' }
    process.env.FIREBASE_PROJECT_ID = 'production-project'
    expect(() => checkConfiguration(expected)).toThrowError('FIREBASE_PROJECT_ID does not match --expect-project')
    delete process.env.FIREBASE_PROJECT_ID
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: 'production-project' })
    expect(() => checkConfiguration(expected)).toThrowError('FIREBASE_SERVICE_ACCOUNT.project_id does not match --expect-project')
  })

  it('rejects memory storage and a Firestore emulator for cloud checks', () => {
    const expected = { project: 'staging-project' }
    process.env.NOTIFICATION_STORE = 'memory'
    expect(() => checkConfiguration(expected)).toThrowError(/cannot verify deployment persistence/)
    delete process.env.NOTIFICATION_STORE
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
    expect(() => checkConfiguration(expected)).toThrowError(/cannot verify the named cloud project/)
  })
})

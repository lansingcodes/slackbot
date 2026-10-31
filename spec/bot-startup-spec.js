const { spawnSync } = require('node:child_process')
const path = require('node:path')

describe('bot startup', () => {
  it('loads every script without errors in config-check mode', () => {
    const root = path.resolve(__dirname, '..')
    const result = spawnSync('./bin/hubot', ['--adapter', '@hubot-friends/hubot-slack', '--config-check'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 15000,
      env: {
        ...process.env,
        HUBOT_SLACK_APP_TOKEN: 'xapp-test',
        HUBOT_SLACK_BOT_TOKEN: 'xoxb-test',
        FIREBASE_WEB_CONFIG: JSON.stringify({ apiKey: 'test', projectId: 'demo-lansingcodes', appId: 'test' }),
        HUBOT_HEROKU_KEEPALIVE_URL: 'https://example.invalid/',
        HUBOT_HEROKU_KEEPALIVE_INTERVAL: '0',
        NOTIFICATION_STORE: 'memory'
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.status).toBe(0)
    const output = result.stdout + result.stderr
    expect(output).toMatch(/\bOK\b/)
    expect(output).not.toMatch(/"level":50|Unable to load|Error loading file/)
  })
})

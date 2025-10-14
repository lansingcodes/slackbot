const { spawn } = require('child_process')
const path = require('path')

describe('bot startup', () => {
  // Set a reasonable timeout for bot startup
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

  it('should start and shutdown successfully', (done) => {
    // Spawn the bot process using the mock adapter
    const hubotPath = path.join(__dirname, '..', 'node_modules', '.bin', 'hubot')
    const bot = spawn(hubotPath, ['--adapter', 'mock-adapter', '--name', 'slackbot', '--disable-httpd'], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        // Prevent the bot from trying to load environment-specific configs
        NODE_ENV: 'test',
        // Provide minimal Firebase config to allow startup
        FIREBASE_WEB_CONFIG: JSON.stringify({
          apiKey: 'test-api-key',
          authDomain: 'test.firebaseapp.com',
          projectId: 'test-project',
          storageBucket: 'test.appspot.com',
          messagingSenderId: '123456789',
          appId: 'test-app-id'
        }),
        // Add PATH to include node_modules/.bin for coffee command
        PATH: `${path.join(__dirname, '..', 'node_modules', '.bin')}:${process.env.PATH}`,
        // Disable the Heroku keepalive to avoid warning errors
        HUBOT_HTTPD: 'false'
      }
    })

    let stdout = ''
    let stderr = ''
    let hasStarted = false
    let shutdownTimer = null
    let safetyTimeout = null

    // Safety timeout - if the bot doesn't start within 20 seconds, fail the test
    safetyTimeout = setTimeout(() => {
      bot.kill('SIGTERM')
      fail('Bot did not start within the timeout period')
    }, 20000)

    // Collect stdout
    bot.stdout.on('data', (data) => {
      const output = data.toString()
      stdout += output

      // Check for critical errors in stdout (some logging frameworks output to stdout)
      if (!hasStarted && (output.includes('Unable to load') || output.includes('is not valid JSON'))) {
        // Bot has a critical error, terminate it gracefully
        bot.kill('SIGTERM')
      }
    })

    // Collect stderr
    bot.stderr.on('data', (data) => {
      const output = data.toString()
      stderr += output

      // Check if the bot has successfully started
      // We look for any deprecation warning or the keepalive error,
      // both of which indicate the bot loaded its scripts successfully
      if (!hasStarted && (output.includes('DeprecationWarning') || output.includes('hubot-heroku-keepalive'))) {
        hasStarted = true
        // Give the bot a moment to fully initialize, then gracefully shutdown
        shutdownTimer = setTimeout(() => {
          bot.kill('SIGTERM')
        }, 2000)
      }
    })

    // Handle bot exit
    bot.on('close', (code) => {
      if (shutdownTimer) {
        clearTimeout(shutdownTimer)
      }
      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
      }

      // Check that the bot started successfully before exiting
      expect(hasStarted).toBe(true)

      // Check that there are no critical startup errors in stdout or stderr
      // We allow the heroku-keepalive warning and deprecation warnings
      const combinedOutput = stdout + stderr
      expect(combinedOutput).not.toMatch(/SyntaxError/)
      expect(combinedOutput).not.toMatch(/Cannot find module/)
      expect(combinedOutput).not.toMatch(/Unable to load/)
      expect(combinedOutput).not.toMatch(/is not valid JSON/)

      // Check that the bot exited gracefully (code 0 or null for SIGTERM)
      // SIGTERM can result in null or 0 depending on the process
      expect(code === 0 || code === null).toBe(true)

      done()
    })

    // Handle errors spawning the process
    bot.on('error', (err) => {
      if (shutdownTimer) {
        clearTimeout(shutdownTimer)
      }
      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
      }
      fail(`Failed to start bot: ${err.message}`)
    })
  })
})

const { spawn } = require('child_process')
const path = require('path')

const STABILITY_WINDOW_MS = 5000
const STARTUP_PATTERNS = [
  /DeprecationWarning/i,
  /hubot-heroku-keepalive/i,
  /Slack client now connected/i
]

const CRITICAL_PATTERNS = [
  { pattern: /UnhandledPromiseRejectionWarning/i, reason: 'Unhandled promise rejection during startup' },
  { pattern: /Unhandled rejection/i, reason: 'Unhandled promise rejection during startup' },
  { pattern: /TypeError:/, reason: 'Type error emitted during startup' },
  { pattern: /ReferenceError:/, reason: 'Reference error emitted during startup' },
  { pattern: /RangeError:/, reason: 'Range error emitted during startup' },
  { pattern: /FirebaseError/i, reason: 'Firebase configuration error reported during startup' },
  { pattern: /ECONN(REFUSED|RESET)|ENOTFOUND|EAI_AGAIN/, reason: 'Network connectivity failure detected during startup' },
  { pattern: /Force restarting due to disconnect/, reason: 'Bot attempted to self-restart due to disconnect' }
]

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

    if (typeof bot.stdout?.setMaxListeners === 'function') {
      bot.stdout.setMaxListeners(20)
    }

    if (typeof bot.stderr?.setMaxListeners === 'function') {
      bot.stderr.setMaxListeners(20)
    }

    let stdout = ''
    let stderr = ''
    let hasStarted = false
    let shutdownTimer = null
    let safetyTimeout = null
    let testCompleted = false
    let startTrigger = null
    let pendingDisconnects = 0
    const criticalIssues = []

    // Helper to complete the test only once
    const completeTest = () => {
      if (!testCompleted) {
        testCompleted = true
        // Clear all timers to ensure proper cleanup
        if (shutdownTimer) {
          clearTimeout(shutdownTimer)
        }
        if (safetyTimeout) {
          clearTimeout(safetyTimeout)
        }
        done()
      }
    }

    const recordCriticalIssue = (reason, stream, line) => {
      const message = `${reason} [${stream}]: ${line}`
      if (!criticalIssues.includes(message)) {
        criticalIssues.push(message)
      }
    }

    const scheduleShutdown = () => {
      if (shutdownTimer) {
        return
      }

      shutdownTimer = setTimeout(() => {
        bot.kill('SIGTERM')
      }, STABILITY_WINDOW_MS)
    }

    const markStarted = (triggerLine) => {
      if (hasStarted) {
        return
      }

      hasStarted = true
      startTrigger = triggerLine

      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
        safetyTimeout = null
      }

      scheduleShutdown()
    }

    const evaluateLine = (stream, line) => {
      const trimmedLine = line.trim()

      if (trimmedLine.length === 0) {
        return
      }

      if (!hasStarted && STARTUP_PATTERNS.some(pattern => pattern.test(trimmedLine))) {
        markStarted(`${stream}: ${trimmedLine}`)
      }

      if (trimmedLine.includes('Slack client closed, waiting for reconnect')) {
        pendingDisconnects += 1
      }

      if (trimmedLine.includes('Slack client now connected') && pendingDisconnects > 0) {
        pendingDisconnects -= 1
      }

      if (trimmedLine.includes('Unable to load') || trimmedLine.includes('is not valid JSON')) {
        recordCriticalIssue('Critical script load failure', stream, trimmedLine)
        bot.kill('SIGTERM')
      }

      CRITICAL_PATTERNS.forEach(({ pattern, reason }) => {
        if (pattern.test(trimmedLine)) {
          recordCriticalIssue(reason, stream, trimmedLine)
          bot.kill('SIGTERM')
        }
      })
    }

    const evaluateOutput = (stream, data) => {
      const output = data.toString()

      if (stream === 'stdout') {
        stdout += output
      } else {
        stderr += output
      }

      output.split(/\r?\n/).forEach(line => evaluateLine(stream, line))
    }

    // Safety timeout - if the bot doesn't start within 20 seconds, fail the test
    safetyTimeout = setTimeout(() => {
      bot.kill('SIGTERM')
      fail('Bot did not start within the timeout period')
      completeTest()
    }, 20000)

    // Collect stdout
    bot.stdout.on('data', (data) => {
      evaluateOutput('stdout', data)
    })

    // Collect stderr
    bot.stderr.on('data', (data) => {
      evaluateOutput('stderr', data)
    })

    // Handle bot exit
    bot.on('close', (code) => {
      // Check that the bot started successfully before exiting
      expect(hasStarted).toBe(true)
      expect(startTrigger).withContext('No startup indicator detected in process output').not.toBeNull()

      // Check that there are no critical startup errors in stdout or stderr
      // We allow the heroku-keepalive warning and deprecation warnings
      const combinedOutput = stdout + stderr
      expect(combinedOutput).not.toMatch(/SyntaxError/)
      expect(combinedOutput).not.toMatch(/Cannot find module/)
      expect(combinedOutput).not.toMatch(/Unable to load/)
      expect(combinedOutput).not.toMatch(/is not valid JSON/)

      expect(pendingDisconnects).withContext('Detected Slack disconnect without a corresponding reconnect').toBe(0)
      expect(criticalIssues.length).withContext(`Critical issues during startup:\n${criticalIssues.join('\n')}`).toBe(0)

      // Check that the bot exited gracefully (code 0 or null for SIGTERM)
      // SIGTERM can result in null or 0 depending on the process
      expect(code === 0 || code === null).toBe(true)

      completeTest()
    })

    // Handle errors spawning the process
    bot.on('error', (err) => {
      fail(`Failed to start bot: ${err.message}`)
      completeTest()
    })
  })
})

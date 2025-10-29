const { spawn } = require('child_process')
const path = require('path')

const STABILITY_WINDOW_MS = 5000
const isWindows = process.platform === 'win32'
const hubotScriptPath = path.join(__dirname, '..', 'node_modules', 'hubot', 'bin', 'hubot.js')
const hubotArgs = ['--adapter', 'mock-adapter', '--name', 'slackbot', '--disable-httpd']
const nodeBinPath = path.join(__dirname, '..', 'node_modules', '.bin')
const existingPath = process.env.PATH || process.env.Path || ''
const terminationSignal = 'SIGTERM'
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
    const command = process.execPath
    const args = ['--require', 'coffeescript/register', hubotScriptPath, ...hubotArgs]

    const bot = spawn(command, args, {
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
        PATH: `${nodeBinPath}${path.delimiter}${existingPath}`,
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

    const clearTimers = () => {
      if (shutdownTimer) {
        clearTimeout(shutdownTimer)
        shutdownTimer = null
      }

      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
        safetyTimeout = null
      }
    }

    const finishWithSuccess = () => {
      if (testCompleted) {
        return
      }

      testCompleted = true
      clearTimers()
      done()
    }

    const finishWithFailure = (reason) => {
      if (testCompleted) {
        return
      }

      testCompleted = true
      clearTimers()
      if (reason instanceof Error) {
        done.fail(reason)
      } else {
        done.fail(new Error(reason))
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
        bot.kill(terminationSignal)
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
        bot.kill(terminationSignal)
      }

      CRITICAL_PATTERNS.forEach(({ pattern, reason }) => {
        if (pattern.test(trimmedLine)) {
          recordCriticalIssue(reason, stream, trimmedLine)
          bot.kill(terminationSignal)
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
      bot.kill(terminationSignal)
      finishWithFailure('Bot did not start within the timeout period')
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
      if (testCompleted) {
        return
      }

      const issues = []

      if (!hasStarted) {
        issues.push('Bot did not emit any expected startup output')
      }

      if (!startTrigger) {
        issues.push('No startup indicator detected in process output')
      }

      const combinedOutput = stdout + stderr
      const disallowedPatterns = [
        { regex: /SyntaxError/, reason: 'SyntaxError detected during startup' },
        { regex: /Cannot find module/, reason: 'Missing module detected during startup' },
        { regex: /Unable to load/, reason: 'Unable to load resource during startup' },
        { regex: /is not valid JSON/, reason: 'Invalid JSON detected during startup' }
      ]

      disallowedPatterns.forEach(({ regex, reason }) => {
        if (regex.test(combinedOutput)) {
          issues.push(reason)
        }
      })

      if (pendingDisconnects !== 0) {
        issues.push('Detected Slack disconnect without a corresponding reconnect')
      }

      if (criticalIssues.length > 0) {
        issues.push(`Critical issues during startup:\n${criticalIssues.join('\n')}`)
      }

      const acceptableExit = code === 0 || code === null || (isWindows && code === 1)
      if (!acceptableExit) {
        issues.push(`Unexpected exit code: ${code}`)
      }

      if (issues.length > 0) {
        finishWithFailure(issues.join('\n'))
      } else {
        finishWithSuccess()
      }
    })

    // Handle errors spawning the process
    bot.on('error', (err) => {
      finishWithFailure(`Failed to start bot: ${err.message}`)
    })
  })
})

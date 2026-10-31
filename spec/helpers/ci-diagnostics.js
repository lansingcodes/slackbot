// Temporary CI diagnosis: remove after locating the early test-process exit.
if (process.env.CIRCLECI) {
  const exit = process.exit
  process.exit = function (code) {
    process.stderr.write(`CI diagnostic: process.exit(${code})\n${new Error().stack}\n`)
    return exit.call(process, code)
  }
  jasmine.getEnv().addReporter({
    specStarted: ({ fullName }) => process.stderr.write(`CI diagnostic: starting ${fullName}\n`)
  })
}

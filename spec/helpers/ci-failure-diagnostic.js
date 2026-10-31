// Temporary CI diagnosis; remove after the hidden Jasmine failure is known.
if (process.env.CIRCLECI) {
  jasmine.getEnv().addReporter({
    specDone: result => {
      if (result.status !== 'passed') {
        process.stderr.write(`CI diagnostic: ${result.fullName}: ${result.status}\n`)
        for (const failure of result.failedExpectations) {
          process.stderr.write(`${failure.message}\n${failure.stack}\n`)
        }
      }
    },
    jasmineDone: result => process.stderr.write(`CI diagnostic: suite ${result.overallStatus}\n`)
  })
}

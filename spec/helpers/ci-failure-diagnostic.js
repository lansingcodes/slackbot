// Temporary CI-only reporter; remove once the hidden suite error is resolved.
if (process.env.CIRCLECI) {
  let reported = false
  jasmine.getEnv().addReporter({
    suiteDone: result => {
      if (reported || !result.failedExpectations?.length) return
      reported = true
      const failure = result.failedExpectations[0]
      process.stderr.write(`CI diagnostic: ${result.fullName}: ${failure.message}\n${failure.stack}\n`)
    },
    jasmineDone: result => process.stderr.write(`CI diagnostic: overall ${result.overallStatus}\n`)
  })
}

jasmine.getEnv().addReporter({
  jasmineDone: result => {
    process.stderr.write(`JASMINE DONE: ${result.overallStatus}\n`)
    for (const failure of result.failedExpectations || []) {
      process.stderr.write(`${failure.message}\n`)
    }
  },
  suiteDone: result => {
    if (result.status !== 'failed') return
    process.stderr.write(`FAILED SUITE: ${result.fullName}\n`)
    for (const failure of result.failedExpectations || []) {
      process.stderr.write(`${failure.message}\n`)
    }
  },
  specDone: result => {
    if (result.status !== 'failed') return
    process.stderr.write(`FAILED SPEC: ${result.fullName}\n`)
    for (const failure of result.failedExpectations) {
      process.stderr.write(`${failure.message}\n`)
    }
  }
})

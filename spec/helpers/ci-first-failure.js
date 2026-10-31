let reported = false

jasmine.getEnv().addReporter({
  suiteDone: result => {
    if (reported || !result.failedExpectations.length) return
    reported = true
    const failure = result.failedExpectations[0]
    process.stderr.write(`FIRST CI FAILURE: ${result.fullName}\n${failure.stack}\n`)
  }
})

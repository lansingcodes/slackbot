jasmine.getEnv().addReporter({
  specDone: result => {
    if (result.status !== 'failed') return
    process.stderr.write(`FAILED SPEC: ${result.fullName}\n`)
    for (const failure of result.failedExpectations) {
      process.stderr.write(`${failure.message}\n`)
    }
  }
})

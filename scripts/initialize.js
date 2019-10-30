// Description:
//   Load all initializer scripts.
//
// Dependencies:
//   "fs"
//   "path"
//
// Notes:
//   Assumes all initializers live in '../lib/initializers', and that all files in
//   '../lib/initializers' are initializers.
//
// Author:
//   chrisvfritz

const fs = require('fs')
const path = require('path')

module.exports = (robot) => {
  robot.error((error, message) => {
    robot.logger.error(`${error}\n${error.stack}`)
    return process.exit(1)
  })

  const initializersFolder = path.join(__dirname, '../lib/initializers')

  fs.readdirSync(initializersFolder).forEach((file) => {
    try {
      const filepath = path.join(initializersFolder, file)
      require(filepath)(robot)
      robot.parseHelp(filepath)
    } catch (error) {
      robot.logger.error(`Unable to load ${file}: ${error.stack}`)
      process.exit(1)
    }
  })
}

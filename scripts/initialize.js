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
const legacyScripts = require('../legacy-scripts.json')
const loadLegacyScripts = require('../lib/load-legacy-scripts')

require('coffeescript/register')

module.exports = async (robot) => {
  robot.error((error, message) => {
    robot.logger.error(`${error}\n${error.stack}`)
    return process.exit(1)
  })

  const initializersFolder = path.join(__dirname, '../lib/initializers')

  for (const file of fs.readdirSync(initializersFolder)) {
    try {
      const filepath = path.join(initializersFolder, file)
      await require(filepath)(robot)
      robot.parseHelp(filepath)
    } catch (error) {
      robot.logger.error(`Unable to load ${file}: ${error.stack}`)
      process.exit(1)
    }
  }

  if (!robot.router) robot.setupNullRouter()

  try {
    await loadLegacyScripts(robot, legacyScripts)
  } catch (error) {
    robot.logger.error(`Unable to load a legacy script: ${error.stack}`)
    process.exit(1)
  }
}

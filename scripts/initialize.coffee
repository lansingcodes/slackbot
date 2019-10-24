# Description:
#   Load all initializer scripts.
#
# Dependencies:
#   "fs"
#   "livescript"
#   "path"
#   "prelude-ls"
#
# Configuration:
#   N/A
#
# Commands:
#   N/A
#
# Notes:
#   Assumes all initializers live in '../lib/initializers', and that all files in
#   '../lib/initializers' are initializers.
#
# Author:
#   chrisvfritz

require 'livescript'
for key, value of require('prelude-ls')
  global[key] = value

fs   = require 'fs'
path = require 'path'

module.exports = (robot) ->

  robot.error (error, message) ->
    robot.logger.error "#{error}\n#{error.stack}"
    process.exit 1

  initializersFolder = path.join __dirname, '../lib/initializers'

  for file in fs.readdirSync(initializersFolder)
    try
      filepath = path.join initializersFolder, file
      require(filepath) robot
      robot.parseHelp filepath
    catch error
      robot.logger.error "Unable to load #{file}: #{error.stack}"
      process.exit 1

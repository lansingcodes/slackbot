require 'livescript'
for key, value of require('prelude-ls')
  global[key] = value

fs   = require 'fs'
path = require 'path'

module.exports = (robot) ->

  livescriptFolder = path.join __dirname, '_livescripts'

  for file in fs.readdirSync(livescriptFolder)
    ext = path.extname file
    if ext is '.ls'
      try
        filepath = path.join livescriptFolder, file
        require(filepath) robot
        robot.parseHelp filepath
      catch error
        robot.logger.error "Unable to load #{file}: #{error.stack}"
        process.exit 1

require 'livescript'
for key, value of require('prelude-ls')
  global[key] = value

fs   = require 'fs'
path = require 'path'

module.exports = (robot) ->

  for file in fs.readdirSync(__dirname)
    ext = path.extname file
    if ext is '.ls'
      try
        filepath = path.join __dirname, file
        robot.parseHelp filepath
      catch error
        robot.logger.error "Unable to load #{file}: #{error.stack}"
        process.exit 1

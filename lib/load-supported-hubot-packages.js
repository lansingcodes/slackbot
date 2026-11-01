// These packages already ship JavaScript command implementations. Load their
// implementations directly because their old index wrappers call Hubot's
// removed loadFile API. The CoffeeScript commands live in local initializers.
const sources = [
  'hubot-diagnostics/src/diagnostics.js',
  'hubot-help/src/help.js',
  'hubot-rules/src/rules.js'
]

module.exports = async robot => {
  for (const source of sources) {
    const filepath = require.resolve(source)
    await require(filepath)(robot)
    robot.parseHelp(filepath)
  }
}

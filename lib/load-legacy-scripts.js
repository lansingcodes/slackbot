const fs = require('node:fs')
const path = require('node:path')

require('coffeescript/register')

module.exports = async (robot, packages) => {
  for (const name of packages) {
    const packageFolder = path.dirname(require.resolve(name))
    const scriptsFolder = path.join(packageFolder, 'src')
    const coffeeScripts = fs.existsSync(scriptsFolder)
      ? fs.readdirSync(scriptsFolder).filter(file => file.endsWith('.coffee'))
      : []

    if (coffeeScripts.length > 0) {
      for (const file of coffeeScripts) {
        const script = path.join(scriptsFolder, file)
        await require(script)(robot)
        robot.parseHelp(script)
      }
    } else {
      await require(name)(robot)
    }
  }
}

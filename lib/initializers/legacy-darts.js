// Description:
//   Have a foam dart fight.
// Commands:
//   hubot shoot target (in the legs/head/body) - Fire a foam dart
// Based on hubot-darts 1.0.4 (MIT); see docs/legacy-command-attribution.md.

module.exports = robot => {
  robot.respond(/shoot ((.+)(?: in the )(head|body|legs)?|(.*))/i, msg => {
    let victimName = msg.match[2] || msg.match[4]
    if (victimName.startsWith('@')) victimName = victimName.slice(1)

    const users = robot.brain.usersForFuzzyName(victimName)
    if (users.length > 1) {
      msg.reply("Be more specific; I can't shoot more than one person at once!")
      return
    }
    const victim = users.length === 1 ? users[0] : null
    if (!victim) {
      msg.reply("You want me to shoot someone who doesn't exist.  You are strange.")
      return
    }

    msg.reply('Target acquired.')
    const aim = msg.match[3] || msg.random(['head', 'body', 'legs'])
    const target = msg.random([aim, aim, aim, aim, 'miss'])
    const name = victim.name
    const hits = {
      head: [
        `It hits ${name} right in the eye!  You monster!`,
        `It bounces right off ${name}'s nose.`,
        `It hits ${name} in the ear.  Why would you do that?`,
        `POW!  BANG!  ${name} is hit right in the kisser!`,
        `Right in the temple.  ${name} falls limp to the floor.`
      ],
      body: [
        `The shot bounces off ${name}'s shoulder.`,
        `It hits ${name} right in the chest.  ${name} has trouble drawing their next breath.`,
        `The dart hits ${name} in the stomach and gets lodged in their belly button.`,
        `It hits ${name} in the back, causing temporary paralysis.`,
        `The dart bounces off ${name}'s left shoulder, spinning them violently around.`
      ],
      legs: [
        `The dart smacks into ${name}'s thigh.  Charlie Horse!!!`,
        `The dart hits ${name} square in the crotch.  I need an adult!`,
        `It hits ${name} right in the kneecap.  What did they owe you money?`,
        `It smacks into ${name}'s pinkie toe.  They go wee wee wee all the way home!`,
        `The dart hits right on ${name}'s shin, knocking them to the ground`
      ]
    }
    const result = target === 'miss' ? 'The shot sails safely overhead.' : msg.random(hits[target])
    msg.emote(`fires a foam dart at ${name}'s ${aim}.  ${result}`)
  })
}

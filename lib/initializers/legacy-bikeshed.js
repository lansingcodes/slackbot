// Description:
//   Explain bikeshedding and suggest a color.
// Commands:
//   What is bikeshedding? - Explain bikeshedding
//   bikeshed - Suggest a bikeshed color
//   bikeshedding - Suggest a bikeshed color
// Based on hubot-bikeshed 1.3.0 (MIT); see docs/legacy-command-attribution.md.

const explanation = 'The term was coined as a metaphor to illuminate Parkinson’s Law of Triviality. Parkinson observed that a committee whose job is to approve plans for a nuclear power plant may spend the majority of its time on relatively unimportant but easy-to-grasp issues, such as what materials to use for the staff bikeshed, while neglecting the design of the power plant itself, which is far more important but also far more difficult to criticize constructively. It was popularized in the Berkeley Software Distribution community by Poul Henning-Kamp and has spread from there to the software industry at large.'

module.exports = robot => {
  robot.hear(/What is bikeshedding\?/i, msg => msg.send(explanation))

  robot.hear(/\bbike(shed|shedding)\b/i, async msg => {
    try {
      const response = await fetch('https://www.thecolorapi.com/random', {
        signal: AbortSignal.timeout(5000)
      })
      if (!response.ok) throw new Error(`Color API HTTP ${response.status}`)
      const color = await response.json()
      if (!/^#[0-9a-f]{6}$/i.test(color.hex?.value) || !/^[0-9a-f]{6}$/i.test(color.hex?.clean)) {
        throw new Error('Invalid color response')
      }
      msg.send(`If we are talking about bikesheds, I suggest we should use ${color.hex.value}, for you humans, http://www.color-hex.com/color/${color.hex.clean}`)
    } catch {
      msg.send("Seems thecolorapi.com is down, looks like you'll get #FFFFF")
    }
  })
}

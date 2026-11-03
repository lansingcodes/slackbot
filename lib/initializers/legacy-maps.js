const directionsModes = new Set(['driving', 'walking', 'bicycling'])

function directionsUrl (origin, destination, mode) {
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('origin', origin)
  url.searchParams.set('destination', destination)
  url.searchParams.set('travelmode', mode)
  return url.href
}

module.exports = (robot) => {
  robot.respond(/(?:(driving|walking|bike|biking|bicycling) )?directions from (.+) to (.+)$/i, async msg => {
    let [, rawMode, origin, destination] = msg.match
    const mode = ['bike', 'biking'].includes((rawMode || '').toLowerCase())
      ? 'bicycling'
      : (rawMode || 'driving').toLowerCase()
    origin = origin.trim()
    destination = destination.trim()
    if (origin.toLowerCase() === destination.toLowerCase()) {
      msg.send("Now you're just being silly.")
      return
    }

    const link = directionsUrl(origin, destination, directionsModes.has(mode) ? mode : 'driving')
    const key = process.env.HUBOT_GOOGLE_API_KEY
    if (!key) {
      msg.send(link)
      return
    }

    try {
      const api = new URL('https://maps.googleapis.com/maps/api/directions/json')
      api.searchParams.set('origin', origin)
      api.searchParams.set('destination', destination)
      api.searchParams.set('mode', mode)
      api.searchParams.set('key', key)
      const response = await fetch(api, { signal: AbortSignal.timeout(5000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = await response.json()
      const leg = result.routes?.[0]?.legs?.[0]
      if (result.status !== 'OK' || !leg) throw new Error(result.status || 'No route found')
      const steps = leg.steps.map((step, index) => {
        const instruction = step.html_instructions.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
        return `${index + 1}. ${instruction} (${step.distance.text})`
      })
      msg.send(`Directions from ${leg.start_address} to ${leg.end_address}\n${leg.distance.text} - ${leg.duration.text}\n\n${steps.join('\n')}\n${link}`)
    } catch (error) {
      robot.logger.warn(`Directions details unavailable: ${error.message}`)
      msg.send(`Route details are unavailable right now. Open directions: ${link}`)
    }
  })

  robot.respond(/(?:(satellite|terrain|hybrid)[- ])?map(?: me)? (.+)$/i, msg => {
    const location = msg.match[2].trim()
    const url = new URL('https://www.google.com/maps/search/')
    url.searchParams.set('api', '1')
    url.searchParams.set('query', location)
    msg.send(url.href)
  })
}

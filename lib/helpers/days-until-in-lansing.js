const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Detroit',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const dayNumber = time => {
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(time)).map(part => [part.type, part.value])
  )
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86400000
}

module.exports = (eventTime, now = Date.now()) => dayNumber(eventTime) - dayNumber(now)

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Detroit',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
})

const ordinal = day => {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`
  return `${day}${{ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th'}`
}

module.exports = time => {
  const date = new Date(time)
  if (Number.isNaN(date.valueOf())) return 'Invalid date'
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]))
  return `${parts.weekday}, ${parts.month} ${ordinal(Number(parts.day))} at ${parts.hour}:${parts.minute}${parts.dayPeriod.toLowerCase()}`
}

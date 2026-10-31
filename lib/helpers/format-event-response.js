const formatTime = require('./format-time')
const formatRelativeTime = require('./format-relative-time')

const listTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Detroit',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
})

const formatListTime = time => {
  const date = new Date(time)
  if (Number.isNaN(date.valueOf())) return 'Invalid date'
  const parts = Object.fromEntries(listTimeFormatter.formatToParts(date).map(part => [part.type, part.value]))
  return `${parts.weekday}, ${parts.month} ${parts.day} at ${parts.hour}:${parts.minute}${parts.dayPeriod.toLowerCase()}`
}

const escapeText = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const eventLink = event => {
  const name = escapeText(event.name || 'Untitled event')
  try {
    const url = new URL(event.url)
    if (['http:', 'https:'].includes(url.protocol)) {
      return `<${url.href.replace(/\|/g, '%7C')}|${name}>`
    }
  } catch (_) {}
  return name
}

const upcomingEvents = events => [
  ':calendar: *Upcoming events*',
  ...events.map(event => [
    `• *${formatListTime(event.startTime)}* — ${eventLink(event)}`,
    `  ${escapeText(event.group)} · in ${formatRelativeTime(event.startTime)}`
  ].join('\n')),
  'For details, try `next GROUP event` (for example, `next devops event`).'
].join('\n\n')

const nextEvent = event => [
  `:calendar: *Next ${escapeText(event.group)} event*`,
  eventLink(event),
  `:clock3: ${formatTime(event.startTime)}`,
  'Follow the event link for details and RSVP.'
].join('\n')

module.exports = { upcomingEvents, nextEvent }

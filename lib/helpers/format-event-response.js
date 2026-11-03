const moment = require('moment')
const formatTime = require('./format-time')
const formatRelativeTime = require('./format-relative-time')

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
    `• *${moment(event.startTime).format('ddd, MMM D [at] h:mma')}* — ${eventLink(event)}`,
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

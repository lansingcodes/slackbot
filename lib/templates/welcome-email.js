const moment = require('moment')
const shortenUrl = require('../helpers/shorten-url')
const organizerFor = require('../helpers/organizer-for')
const memberAliasFor = require('../helpers/member-alias-for')
const firstNameFor = require('../helpers/first-name-for')
const parseJsonConfig = require('../helpers/parse-json-config')

const escapeHtml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

module.exports = (event, callback) => {
  const organizer = organizerFor(event.group)
  const configuredNames = process.env.ORGANIZER_FIRST_NAME_BY_GROUP
    ? parseJsonConfig('ORGANIZER_FIRST_NAME_BY_GROUP', process.env.ORGANIZER_FIRST_NAME_BY_GROUP)
    : {}
  const organizerFirstName = configuredNames[event.group] || firstNameFor(organizer)
  const emailSubject = encodeURIComponent(`${event.name} Today!`)
  const eventUrl = new URL(event.url)
  if (!['http:', 'https:'].includes(eventUrl.protocol) || !['meetup.com', 'www.meetup.com'].includes(eventUrl.hostname)) {
    throw new Error('Welcome email requires a Meetup event URL')
  }
  const [groupSlug, , eventId] = eventUrl.pathname.split('/').filter(Boolean)
  if (!groupSlug || !eventId) throw new Error('Welcome email requires a Meetup group slug and event ID')

  const location = [event.venue, event.address].filter(Boolean).map(escapeHtml).join(' — ')
  const locationParagraph = location
    ? `<p><strong>Location:</strong> ${location}. Please confirm the latest directions on the event page.</p>`
    : '<p>Please check the event page for the latest location and arrival details.</p>'
  const emailBody = encodeURIComponent([
    `<p>Fellow ${escapeHtml(memberAliasFor(event.group))},</p>`,
    `<p>Thanks for your RSVP for today's ${escapeHtml(moment(event.startTime).format('h:mma'))} meetup, ${escapeHtml(event.name)}. We're looking forward to seeing you.</p>`,
    locationParagraph,
    `<p>Before you travel, please review the <a href="${escapeHtml(eventUrl.href)}">event page</a> for any updates to the time, location, or refreshments.</p>`,
    '<p>Feel free to bring a laptop if you would like to follow along. You are also welcome to come just to meet other members and learn.</p>',
    '<p>Interested in sharing a topic at a future event? Reply to this message and tell us what you would like to present. First-time speakers are welcome.</p>',
    '<p>See you soon,</p>',
    `<p>${escapeHtml(organizerFirstName)}</p>`
  ].join(''))

  const welcomeTemplateLink = `https://www.meetup.com/${encodeURIComponent(groupSlug)}/messages/send/?who=oneevent&eventId=${encodeURIComponent(eventId)}&boards=1&subject=${emailSubject}&body=${emailBody}`
  return shortenUrl(welcomeTemplateLink, callback)
}

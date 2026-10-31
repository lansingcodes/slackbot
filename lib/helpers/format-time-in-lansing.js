const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Detroit',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
})

module.exports = time => formatter.format(new Date(time)).replace(/\s/g, '').toLowerCase()

// The key matches group.id or event.group in the Firebase data model
module.exports = group => {
  const groupKey = typeof group === 'string' ? group : group?.name
  const configured = process.env.ORGANIZER_BY_GROUP
    ? JSON.parse(process.env.ORGANIZER_BY_GROUP)
    : {}

  return configured[groupKey] || ({
    'demo-night': 'erik.gillespie',
    javascript: 'erik.gillespie'
  })[groupKey]
}

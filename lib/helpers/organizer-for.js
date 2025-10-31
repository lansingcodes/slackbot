// The key matches group.id or event.group in the Firebase data model
const lookup = {
  'demo-night': 'erik.gillespie',
  javascript: 'erik.gillespie',
  'Lansing Javascript Meetup': 'erik.gillespie'
}

const resolveKey = (group) => {
  if (!group) return undefined
  if (typeof group === 'string') return group
  return group.id || group.slug || group.name || group.meetupUrlName
}

module.exports = (group) => lookup[resolveKey(group)]

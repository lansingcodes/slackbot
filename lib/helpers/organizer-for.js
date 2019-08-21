// The key matches group.id or event.group in the Firebase data model
module.exports = group => ({
  'demo-night': 'erik.gillespie',
  'javascript': 'erik.gillespie'
}[group.name])

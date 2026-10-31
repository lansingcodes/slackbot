module.exports = (group) => ({
  'Lansing DevOps Meetup': 'Devs & Ops',
  'Lansing Ruby Meetup Group': 'Rubyists',
  'Lansing Javascript Meetup': 'JSers',
  'Mobile Monday Lansing': 'Mobile Members'
})[typeof group === 'string' ? group : group.name] ||
  (typeof group === 'string' ? group : group.name)

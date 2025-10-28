const aliases = {
  'Lansing DevOps Meetup': 'Devs & Ops',
  devops: 'Devs & Ops',
  'Lansing Ruby Meetup Group': 'Rubyists',
  ruby: 'Rubyists',
  'Lansing Javascript Meetup': 'JSers',
  javascript: 'JSers',
  'Mobile Monday Lansing': 'Mobile Members',
  mobile: 'Mobile Members'
}

const resolveKey = (group) => {
  if (!group) return undefined
  if (typeof group === 'string') return group
  return group.name || group.id || group.slug || group.meetupUrlName
}

module.exports = (group) => aliases[resolveKey(group)]

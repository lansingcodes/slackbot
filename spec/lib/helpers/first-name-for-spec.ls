require! '../../../lib/helpers/first-name-for'

const organizer-usernames = <[ davin atomaka leo ]>

describe 'first-name-for' (_) !->
  it 'should not return `undefined` for organizer usernames' !->
    for username in organizer-usernames
      expect first-name-for(username) .to-be-defined!

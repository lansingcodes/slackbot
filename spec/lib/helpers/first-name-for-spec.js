const firstNameFor = require('../../../lib/helpers/first-name-for');
const organizerUsernames = ['davin', 'atomaka', 'leo'];

describe('first-name-for', () => {
  it ('should not return `undefined` for organizer usernames', () => {
    organizerUsernames.forEach((username) => {
      expect(firstNameFor(username)).toBeDefined();
    });
  });
});

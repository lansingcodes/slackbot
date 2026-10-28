const proxyquire = require('proxyquire')

describe('generate-welcome-email-for', () => {
  it('routes the template to the organizer as a separate room and message', () => {
    const generate = proxyquire('../../../lib/helpers/generate-welcome-email-for', {
      '../templates/welcome-email': (_event, onShortUrl) => onShortUrl('https://tinyurl.com/test')
    })
    const messageRoom = jasmine.createSpy('messageRoom')
    const robot = {
      brain: { usersForFuzzyName: () => [{ id: 'U123' }] },
      messageRoom
    }

    generate({ group: 'javascript' }, robot)

    expect(messageRoom).toHaveBeenCalledOnceWith('U123', jasmine.stringMatching(/https:\/\/tinyurl.com\/test/))
  })
})

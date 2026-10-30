const includeHubot = require('../../helpers/include-hubot')

describe('code-of-conduct', () => {
  includeHubot()

  afterEach(() => {
    delete process.env.SLACKBOT_CODE_OF_CONDUCT_URL
    delete process.env.SLACKBOT_MODERATORS
  })

  it('replies to a direct command with the current policy link', async () => {
    require('../../../lib/initializers/code-of-conduct')(robot)
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)

    await hubotHelpers.receiveMessage('slackbot code of conduct')

    expect(sent).toHaveBeenCalledTimes(1)
    expect(sent.calls.mostRecent().args[1][0]).toContain('https://www.lansing.codes/code-of-conduct/')
  })

  it('replies to a plain question without posting twice', async () => {
    require('../../../lib/initializers/code-of-conduct')(robot)
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)

    await hubotHelpers.receiveMessage('Is there a code of conduct?')

    expect(sent).toHaveBeenCalledTimes(1)
  })

  it('uses a configured policy and moderator IDs', async () => {
    process.env.SLACKBOT_CODE_OF_CONDUCT_URL = 'https://example.org/policy'
    process.env.SLACKBOT_MODERATORS = 'U0123456789, @organizer'
    require('../../../lib/initializers/code-of-conduct')(robot)
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)

    await hubotHelpers.receiveMessage('code of conduct')

    expect(sent).toHaveBeenCalledTimes(1)
    expect(sent.calls.mostRecent().args[1][0]).toContain('https://example.org/policy')
    expect(sent.calls.mostRecent().args[1][0]).toContain('<@U0123456789>, @organizer')
  })

  it('rejects unsafe policy links and moderator names at startup', () => {
    process.env.SLACKBOT_CODE_OF_CONDUCT_URL = 'http://example.org/policy'
    expect(() => require('../../../lib/initializers/code-of-conduct')(robot)).toThrowError(/HTTPS URL/)

    process.env.SLACKBOT_CODE_OF_CONDUCT_URL = 'https://example.org/policy'
    process.env.SLACKBOT_MODERATORS = 'person\n@here'
    expect(() => require('../../../lib/initializers/code-of-conduct')(robot)).toThrowError(/Slack IDs or usernames/)

    process.env.SLACKBOT_MODERATORS = '@here'
    expect(() => require('../../../lib/initializers/code-of-conduct')(robot)).toThrowError(/broadcast mentions/)
  })
})

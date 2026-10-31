const includeHubot = require('../../helpers/include-hubot')
let TextMessage

describe('legacy video room commands', () => {
  includeHubot()

  beforeAll(async () => { ({ TextMessage } = await import('hubot')) })
  beforeEach(() => require('../../../lib/initializers/legacy-video-rooms')(robot))

  it('keeps appearin room names and returns a usable HTTPS meeting link', async () => {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)
    await robot.adapter.receive(new TextMessage({ name: 'tester', room: 'test' }, 'slackbot appearin Lansing Codes'))
    expect(sent.calls.mostRecent().args[1][0]).toBe('https://meet.jit.si/Lansing-Codes')
  })

  it('generates a distinct room when no name is supplied', async () => {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)
    await robot.adapter.receive(new TextMessage({ name: 'tester', room: 'test' }, 'slackbot appearin'))
    expect(sent.calls.mostRecent().args[1][0]).toMatch(/^https:\/\/meet\.jit\.si\/LansingCodes-[a-f0-9]{24}$/)
  })
})

const includeHubot = require('../../helpers/include-hubot')
let TextMessage

describe('legacy map commands', () => {
  includeHubot()

  beforeAll(async () => { ({ TextMessage } = await import('hubot')) })
  beforeEach(() => require('../../../lib/initializers/legacy-maps')(robot))
  afterEach(() => { delete process.env.HUBOT_GOOGLE_API_KEY })

  async function replyTo (command) {
    const sent = jasmine.createSpy('sent')
    robot.adapter.on('send', sent)
    await robot.adapter.receive(new TextMessage({ name: 'tester', room: 'test' }, command))
    return sent.calls.mostRecent().args[1][0]
  }

  it('returns an HTTPS Google Maps search link without an API key', async () => {
    const reply = await replyTo('slackbot map me Lansing, MI')
    expect(reply).toContain('https://www.google.com/maps/search/?api=1&query=Lansing%2C+MI')
  })

  it('returns bicycle directions without an API key', async () => {
    const reply = await replyTo('slackbot bike directions from Lansing to East Lansing')
    expect(reply).toContain('https://www.google.com/maps/dir/?api=1')
    expect(reply).toContain('travelmode=bicycling')
    expect(reply).toContain('origin=Lansing')
    expect(reply).toContain('destination=East+Lansing')
  })

  it('retains inline route details when a Google API key is configured', async () => {
    process.env.HUBOT_GOOGLE_API_KEY = 'unit-test-key'
    const originalFetch = global.fetch
    global.fetch = jasmine.createSpy('fetch').and.resolveTo({
      ok: true,
      json: async () => ({
        status: 'OK',
        routes: [{
          legs: [{
            start_address: 'Lansing, MI',
            end_address: 'East Lansing, MI',
            distance: { text: '4 mi' },
            duration: { text: '10 mins' },
            steps: [{ html_instructions: 'Head <b>east</b>', distance: { text: '1 mi' } }]
          }]
        }]
      })
    })
    try {
      const reply = await replyTo('slackbot directions from Lansing to East Lansing')
      expect(reply).toContain('Directions from Lansing, MI to East Lansing, MI')
      expect(reply).toContain('1. Head east (1 mi)')
      expect(reply).toContain('https://www.google.com/maps/dir/?api=1')
    } finally {
      global.fetch = originalFetch
    }
  })
})

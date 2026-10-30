const proxyquire = require('proxyquire').noCallThru()

describe('troubleshooter authorization', () => {
  const originalIds = process.env.TROUBLESHOOTER_USER_IDS
  let handlers
  let cleared
  let fetched
  let onEnter

  const initialize = () => {
    handlers = []
    cleared = 0
    fetched = 0
    const init = proxyquire('../../../lib/initializers/troubleshooter', {
      '../cachers/events-cacher': () => ({
        clearAll: () => { cleared++ },
        getAll: () => [],
        cache: () => {}
      }),
      '../fetchers/events-fetcher': () => {
        fetched++
        return Promise.resolve({ upcoming: () => Promise.resolve([]) })
      }
    })
    init({
      respond: (pattern, handler) => handlers.push([pattern, handler]),
      enter: handler => { onEnter = handler }
    })
  }

  const run = async (command, user) => {
    const handler = handlers.find(([pattern]) => pattern.test(command))[1]
    const send = jasmine.createSpy('send')
    await handler({ envelope: { user }, send })
    return send
  }

  afterEach(() => {
    if (originalIds === undefined) delete process.env.TROUBLESHOOTER_USER_IDS
    else process.env.TROUBLESHOOTER_USER_IDS = originalIds
  })

  it('rejects a matching legacy name when the Slack ID is not authorized', async () => {
    process.env.TROUBLESHOOTER_USER_IDS = 'UADMIN123'
    initialize()
    const user = { id: 'UUNTRUSTED', name: 'erik.gillespie' }
    for (const command of [
      'silently update notifications cache',
      'inspect upcoming events',
      'inspect notifications cache',
      'clear notifications cache'
    ]) {
      expect(await run(command, user)).not.toHaveBeenCalled()
    }
    expect(cleared).toBe(0)
    expect(fetched).toBe(0)
  })

  it('allows a configured Slack ID regardless of display name', async () => {
    process.env.TROUBLESHOOTER_USER_IDS = 'UOTHER123, UADMIN123'
    initialize()
    expect(await run('clear notifications cache', { id: 'UADMIN123', name: 'renamed' }))
      .toHaveBeenCalledWith('Just cleared the notifications cache.')
    expect(cleared).toBe(1)
  })

  it('fails closed when IDs are absent or malformed', async () => {
    process.env.TROUBLESHOOTER_USER_IDS = 'not-a-slack-id'
    initialize()
    await run('clear notifications cache', { id: 'not-a-slack-id', name: 'erik.gillespie' })
    expect(cleared).toBe(0)
  })

  it('returns only the caller ID for identify me', async () => {
    delete process.env.TROUBLESHOOTER_USER_IDS
    initialize()
    const log = spyOn(console, 'log')
    expect(await run('identify me', { id: 'UADMIN123', email: 'private@example.org' }))
      .toHaveBeenCalledWith('Your Slack user ID is UADMIN123.')
    expect(log).not.toHaveBeenCalled()
  })

  it('logs only a user ID and room on a join', () => {
    initialize()
    const log = spyOn(console, 'log')
    onEnter({ envelope: { user: { id: 'UADMIN123', room: 'CROOM123', email: 'private@example.org' } } })
    expect(log).toHaveBeenCalledWith('{"id":"UADMIN123","room":"CROOM123"}')
  })
})

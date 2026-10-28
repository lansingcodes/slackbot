const shortenUrl = require('../../../lib/helpers/shorten-url')

describe('shorten-url', () => {
  const longUrl = 'https://www.meetup.com/example/event/123'

  it('returns a secure TinyURL link', async () => {
    spyOn(global, 'fetch').and.resolveTo({ ok: true, text: async () => 'https://tinyurl.com/example\n' })
    const callback = jasmine.createSpy('callback')

    await shortenUrl(longUrl, callback)

    expect(callback).toHaveBeenCalledOnceWith('https://tinyurl.com/example')
  })

  it('uses the original link when TinyURL is unavailable', async () => {
    spyOn(global, 'fetch').and.rejectWith(new Error('offline'))
    const callback = jasmine.createSpy('callback')

    await shortenUrl(longUrl, callback)

    expect(callback).toHaveBeenCalledOnceWith(longUrl)
  })

  it('rejects an invalid response from TinyURL', async () => {
    spyOn(global, 'fetch').and.resolveTo({ ok: true, text: async () => 'Error' })
    const callback = jasmine.createSpy('callback')

    await shortenUrl(longUrl, callback)

    expect(callback).toHaveBeenCalledOnceWith(longUrl)
  })
})

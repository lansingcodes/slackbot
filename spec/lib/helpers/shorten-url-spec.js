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

  it('keeps the original URL when TinyURL rejects the legacy test input with HTTP 422', async () => {
    const rejectedUrl = 'http://www.google.com'
    const fetchSpy = spyOn(global, 'fetch').and.resolveTo({
      ok: false,
      status: 422,
      text: async () => 'Error'
    })
    const callback = jasmine.createSpy('callback')

    await shortenUrl(rejectedUrl, callback)

    expect(fetchSpy.calls.mostRecent().args[0].searchParams.get('url')).toBe(rejectedUrl)
    expect(callback).toHaveBeenCalledOnceWith(rejectedUrl)
  })

  it('rejects an invalid response from TinyURL', async () => {
    spyOn(global, 'fetch').and.resolveTo({ ok: true, text: async () => 'Error' })
    const callback = jasmine.createSpy('callback')

    await shortenUrl(longUrl, callback)

    expect(callback).toHaveBeenCalledOnceWith(longUrl)
  })
})

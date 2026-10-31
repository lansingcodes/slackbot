module.exports = (longUrl, callback) => {
  const endpoint = new URL('https://tinyurl.com/api-create.php')
  endpoint.searchParams.set('url', longUrl)

  return fetch(endpoint, { signal: AbortSignal.timeout(5000) })
    .then(async response => {
      if (!response.ok) throw new Error('TinyURL request failed')

      const shortUrl = (await response.text()).trim()
      const parsed = new URL(shortUrl)
      if (parsed.protocol !== 'https:' || parsed.hostname !== 'tinyurl.com') {
        throw new Error('TinyURL returned an invalid link')
      }
      return shortUrl
    })
    .catch(() => longUrl)
    .then(callback)
}

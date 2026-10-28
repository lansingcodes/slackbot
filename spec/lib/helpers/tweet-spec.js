const proxyquire = require('proxyquire').noCallThru()

describe('tweet helper', () => {
  const names = [
    'TWITTER_CONSUMER_KEY',
    'TWITTER_CONSUMER_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
  ]
  let original

  beforeEach(() => {
    original = Object.fromEntries(names.map(name => [name, process.env[name]]))
    names.forEach(name => { process.env[name] = `test-${name}` })
  })

  afterEach(() => {
    names.forEach(name => {
      if (original[name] === undefined) delete process.env[name]
      else process.env[name] = original[name]
    })
  })

  it('posts through the X v2 API with the configured user credentials', async () => {
    let credentials
    let postedText
    const helper = proxyquire('../../../lib/helpers/tweet', {
      'twitter-api-v2': {
        TwitterApi: class {
          constructor (config) {
            credentials = config
            this.v2 = { tweet: async text => { postedText = text } }
          }
        }
      }
    })
    const success = jasmine.createSpy('success')
    const error = jasmine.createSpy('error')

    await helper('Test post', error, success)

    expect(credentials).toEqual({
      appKey: 'test-TWITTER_CONSUMER_KEY',
      appSecret: 'test-TWITTER_CONSUMER_SECRET',
      accessToken: 'test-TWITTER_ACCESS_TOKEN',
      accessSecret: 'test-TWITTER_ACCESS_TOKEN_SECRET'
    })
    expect(postedText).toBe('Test post')
    expect(success).toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  it('reports missing credentials without contacting X', async () => {
    delete process.env.TWITTER_ACCESS_TOKEN_SECRET
    const createClient = jasmine.createSpy('createClient')
    const helper = proxyquire('../../../lib/helpers/tweet', {
      'twitter-api-v2': { TwitterApi: createClient }
    })
    const error = jasmine.createSpy('error')
    const success = jasmine.createSpy('success')

    await helper('Test post', error, success)

    expect(error).toHaveBeenCalledWith('X API credentials are not configured')
    expect(createClient).not.toHaveBeenCalled()
    expect(success).not.toHaveBeenCalled()
  })

  it('reports a failed X API request', async () => {
    const helper = proxyquire('../../../lib/helpers/tweet', {
      'twitter-api-v2': {
        TwitterApi: class {
          constructor () {
            this.v2 = { tweet: async () => { throw new Error('API unavailable') } }
          }
        }
      }
    })
    const error = jasmine.createSpy('error')
    const success = jasmine.createSpy('success')

    await helper('Test post', error, success)

    expect(error).toHaveBeenCalledWith('API unavailable')
    expect(success).not.toHaveBeenCalled()
  })
})

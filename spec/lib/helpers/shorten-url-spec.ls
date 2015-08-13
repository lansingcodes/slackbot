require! '../../../lib/helpers/shorten-url'

if process.env.GOOGLE_API_KEY

  describe 'shorten-url' !->
    describe 'when shortening "http://www.google.com/"' !->

      short-url = undefined

      before-each (done) !->
        shorten-url 'http://www.google.com/', (url) !->
          short-url := url
          done!

      she 'it should return a URL beginning with "http://goo.gl/"' !->
        expect short-url.match('http://goo.gl/') .to-be-truthy!

require! '../../../lib/helpers/shorten-url'

describe 'shorten-url' !->
  describe 'when shortening "http://www.google.com/"' !->

    before-each (done) !->
      shorten-url 'http://www.google.com/', (url) !~>
        @short-url = url
        done!

    she 'it should return a URL beginning with "http://goo.gl/"' !->
      expect @short-url.match('http://tinyurl.com/') .to-be-truthy!

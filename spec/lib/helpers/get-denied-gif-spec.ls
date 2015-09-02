require! '../../../lib/helpers/get-denied-gif'

describe 'get-denied-gif' !->
  she 'should return a random string' !->
    expect typeof! get-denied-gif! .to-equal \String

    get-gifs-until-different = (previous-gif) ->
      new-gif = get-denied-gif!
      return true if previous-gif? and previous-gif is not new-gif
      get-gifs-until-different new-gif

    expect get-gifs-until-different! .to-be true

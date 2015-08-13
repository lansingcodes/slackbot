require! moment

module.exports = (time) ->
  time
    |> moment
    |> (.format 'dddd, MMMM Do [at] h:mma')

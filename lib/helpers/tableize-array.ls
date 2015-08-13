module.exports = (list) ->

  max-column-lengths = list
    |> map ->
      it |> map (.length)
    |> -> zip-all ...it
    |> map maximum

  list
    |> map (columns) ->
      number-of-spaces = [0 til columns.length - 1]
        |> map (i) -> max-column-lengths[i] - columns[i].length
        |> (++ [0])
      spaces = number-of-spaces |> map ->
        new Array(it)
          |> map -> ' '
          |> (.join '')
      zip( columns, spaces )
        |> map (.join '')
        |> (.join ' :: ')
    |> (.join '\n')

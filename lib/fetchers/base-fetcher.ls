module.exports = class BaseFetcher

  (@robot) !->

  fetch: (url, callback) !->
    @robot.http(url).get! (error, response, body) !~>
      @robot.emit( 'Error', error, response ) if error?
      body
        |> JSON.parse
        |> @rehydrate
        |> callback

  rehydrate: (json) ->
    new-json = ^^json
    new-json.data |> map (item) ->
      item.relationships = item.relationships |> Obj.map (references-or-reference) ->
        if typeof! references-or-reference is \Array
          references-or-reference = references-or-reference |> map (reference) ->
            new-json.included[reference.type][reference.id]
        else
          references-or-reference = new-json.included[references-or-reference.type][references-or-reference.id]
      item

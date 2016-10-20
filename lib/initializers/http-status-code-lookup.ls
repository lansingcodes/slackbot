require! cheerio

module.exports = (robot) !->

  const strip-citations = ->
    it.replace /\[\d+\]/g, ''

  robot.hear /(?:http|status code) ?(?:status)? (\d+)/i, (message) !->

    console.log JSON.stringify(message.envelope.user.room)

    http-code = message.match.1

    robot
      .http 'https://en.wikipedia.org/wiki/List_of_HTTP_status_codes'
      .get! (error, response, body) !->
        $ = cheerio.load(body)
        $element = $("##{http-code}").parent!
        status-code = $element.text!
        status-description = $element.next('dd').text!
          |> strip-citations
        if status-code
          message.send status-code + '\n' + status-description

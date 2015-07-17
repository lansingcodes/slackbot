require! cheerio

module.exports = (robot) !->

  robot.hear /http (\d+)/i, (message) !->

    http-code = message.match.1

    robot
      .http 'https://en.wikipedia.org/wiki/List_of_HTTP_status_codes'
      .get! (error, response, body) !->
        $ = cheerio.load(body)
        $element = $("##{http-code}").parent!
        status-code = $element.text!
        status-description = $element.next(\dd).text!
        if status-code
          message.send status-code + '\n' + status-description

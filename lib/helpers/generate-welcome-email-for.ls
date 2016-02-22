require! {
  '../helpers/organizer-for'
  '../templates/welcome-email'
}

module.exports = (event, robot) ->
  const organizer = organizer-for event.relationships.group.attributes
  if organizer?
    console.log 'trying to send email'
    welcome-email event, (short-url, event) !->
      console.log 'short url is', short-url
      robot.message-room organizer, "One of your meetups is today! Time to send out a friendly email. But guess what? I like you. So here's a link that will fill out almost everything for you.\n#{short-url}\nYou're welcome. And I love you. Ugh, that was too strong, wasn't it? Just... you're welcome."

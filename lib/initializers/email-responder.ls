require! {
  '../helpers/is-today'
  '../helpers/organizer-for'
  '../helpers/generate-welcome-email-for'
  '../fetchers/upcoming-events-fetcher': UpcomingEventsFetcher
}

module.exports = (robot) !->

  robot.respond /(?:welcome )?emails?/i, (message) !->

    const upcoming-events-fetcher = new UpcomingEventsFetcher(robot)

    upcoming-events-fetcher.all (events) !->

      const current-user = message.envelope.user.name

      for event in events

        const organizer = organizer-for event.relationships.group.attributes
        if current-user is organizer and is-today(event)
          generate-welcome-email-for event, robot

describe-hubot-initializer 'events-responder', (robot, hubot-helpers) !->

  she 'returns the next js meetup when asked for "next js meetup"', (done) !->

    robot.adapter.on 'send', (envelope, strings) !->
      expect strings.0 .to-match /".+" on .+. Learn more and RSVP at http:\/\/www\.meetup\.com\/.+/
      done!

    hubot-helpers.receive-message 'next js meetup'

describe-hubot-initializer 'events-responder', (robot, hubot-helpers) !->

  she 'returns a table of upcoming meetups when asked for "upcoming events"' (done) !->

    robot.adapter.on 'send', (envelope, strings) !->
      expect strings.0 .to-match /Here are the upcoming events \(soonest first\):\n```\n/
      expect strings.0 .to-match /\n```\nEnter `next <meetup-focus> event` \(e\.g\. `next javascript event`\) for more details on a specific event, including a link to RSVP\./
      done!

    hubot-helpers.receive-message 'upcoming events'

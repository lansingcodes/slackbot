require! {
  moment
  '../../src/next-meetup-fetcher': NextMeetupFetcher
  '../../src/organizer-for'
  '../../src/shorten-url'
}

CronJob = require('cron').CronJob

const ROOM = \general

member-alias-for = (group) ->
  {
    'Lansing DevOps Meetup': 'Devs & Ops'
    'Lansing Ruby Meetup Group': 'Rubyists'
    'Lansing Javascript Meetup': 'JSers'
    'Mobile Monday Lansing': 'Mobile Members'
  }[group.name]

first-name-for = (organizer) ->
  {
    'davin': \Davin
    'atomaka': \Andrew
    'leo': \Leo
  }[organizer]

is-today = (event) ->
  event-date = new Date(event.time).set-hours 0 0 0 0
  todays-date = new Date().set-hours 0 0 0 0
  event-date is todays-date

formatted-time-only = (event) ->
  event.time
    |> moment
    |> (.format 'h:mma')

module.exports = (robot) !->
  notifications-cache = undefined

  robot.brain.on 'loaded', !->
    # Get the notifications cache, so that we don't keep notifying about the same
    # meetups over and over again
    notifications-cache := robot.brain.get(\notifications-cache) || {}

  # Checks if we've already notified about this event
  already-notified-regarding = (event) ->
    notifications-cache[event.id.to-string!] is true

  cache-event = (event) !->
    # Update the cache to remember that we've already found this event
    notifications-cache[event.id.to-string!] = true
    # Save the updated cache to lubot's persistent brain
    robot.brain.set \notifications-cache, notifications-cache

  check-for-new-meetups = !->
    # We haven't found any new meetups yet
    events-were-announced = false
    # Say goodmorning
    robot.message-room ROOM, "Good morning everyone! Yawn... I'm gonna grab some coffee and check for newly scheduled meetups."
    # Fetch the latest upcoming event for each group that Lansing Codes is
    # following on meetup.com
    new NextMeetupFetcher(robot).all (events) !->
      # For every event...
      for event in events
        # If we've already notified people about this event...
        if is-today event
          # Remember that there was at least one new meetup found
          events-were-announced = true
          # Cache that we announced the event
          cache-event event
          # Announce today's event
          robot.message-room ROOM, "WAHH! Meetup tonight! It's \"#{event.name}\" at #{formatted-time-only event}. Learn more and RSVP at #{event.event_url}"
          # Send a welcome template to the organizer
          organizer = organizer-for event.group
          if organizer?
            email-subject = "#{event.name} Tonight!" |> encode-URI-component
            email-body = """
              <p>Fellow #{member-alias-for event.group},</p>

              <p>Thank you for your RSVP for tonight's 7pm meetup. We're going to have a great crowd! I'm pretty excited to see SOMETHING_EXCITING.</p>

              <p><strong>How to find us</strong></p>
              <p>If this is your first time and you need help getting to our group, be sure to park in <a href="https://www.google.com/maps/@42.734268,-84.480879,3a,75y,170.84h,85.88t/data=!3m6!1e1!3m4!1sd_i04cP0uHvJdD9MbRm6Zw!2e0!7i13312!8i6656">the MSU parking structure</a> across the street - it's free after 6pm! Then <a href="https://www.google.com/maps/@42.734483,-84.480627,3a,75y,29.57h,89.85t/data=!3m7!1e1!3m5!1sVPGJPxSePSIAAAQfCOpZDA!2e0!3e2!7i13312!8i6656">walk through these doors</a>, take the elevators at the end of the hall to the 3rd floor, and we'll be directly to your left when you exit the elevator.</p>
              <p>If you still need help, simply reply to this email or feel free to text or call Chris Fritz at (517) 803-9346.</p>

              <p><strong>What to bring</strong></p>
              <p>Many people choose to bring a laptop, as there are often opportunities to code along. If that's a pain, all you really need is yourself and an appetite for knowledge.</p>
              <p>As for attire, we're not even business casual - it's casual casual. Though you can wear a fancy dress or nice suit too. That would also be OK. :-)</p>

              <p><strong>Food and drink options</strong></p>
              <p>We'll have Cottage Inn pizza (plain cheese and usually also pepperoni), Soylent (vegan-friendly), Chardonnay, Blue Moon, Sprite, and there's a water fountain where you can fill up a cup. If these options don't work for you, it's totally cool to bring something else for yourself.</p>

              <p><strong>Psst. Over here. I've got a proposition for ya.</strong></p>
              <p>We'd love for you (yes, you!) to reach out to the community and show us what you're excited about. It could be a quick topic (10-20 minutes) or a longer presentation (30-60 minutes). It could be focused on A_FEW_TOPIC_SUGGESTIONS, or whatever else you're into.</p>
              <p>This is a great opportunity to:</p>
              <ul>
                <li><strong>practice presenting</strong> with a friendly crowd</li>
                <li><strong>help our community</strong> learn from your experience</li>
                <li><strong>share your passions</strong> and meet others passionate about the same topics</li>
              </ul>
              <p>If you've never presented before, don't worry, we love first-time presenters! If you're nervous and would like some feedback before you present, we're also happy to meet with you and help you refine it. Reply to this discussion or send me a message with your topic idea and we'll work out a date.</p>

              <p>See you tonight,</p>

              <p>#{first-name-for organizer}</p>
            """ |> (.replace />\s+</g, '><') |> encode-URI-component
            welcome-template-link = "http://www.meetup.com/#{event.group.urlname}/messages/send/?who=oneevent&eventId=#{event.id}&boards=1&subject=#{email-subject}&body=#{email-body}"
            shorten-url welcome-template-link, (short-url) !->
              robot.message-room organizer, "One of your meetups is tonight! Time to send out a friendly email. But guess what? I like you. So here's a link that will fill out almost everything for you.\n#{short-url}\nYou're welcome. And I love you. Ugh, that was too strong, wasn't it? Just... you're welcome."
        else unless already-notified-regarding event
          # Remember that there was at least one new meetup found
          events-were-announced = true
          # Cache that we announced the event
          cache-event event
          # Announce the new event
          robot.message-room ROOM, "There's a new event scheduled for #{event.group.name}: \"#{event.name}\". Find more details at #{event.event_url}"
      # Unless we told people about new meetups...
      unless events-were-announced
        # Tell people we didn't find any meetups.
        robot.message-room ROOM, "I didn't find any new meetups. This coffee's great though!"

  new CronJob '0 0 9 * * *', check-for-new-meetups, null, true

  robot.respond /silently update notifications cache/, (message) !->
    if message.envelope.user.name is \chrisvfritz
      message.send "Silently updating the notifications cache..."
      new NextMeetupFetcher(robot).all (events) !->
        for event in events
          cache-event event

  robot.respond /inspect notifications cache/, (message) !->
    if message.envelope.user.name is \chrisvfritz
      console.log JSON.stringify robot.brain.get \notifications-cache
      message.send "Just printed the cache to the server logs."

  robot.respond /clear notifications cache/, (message) !->
    if message.envelope.user.name is \chrisvfritz
      robot.brain.set \notifications-cache, {}
      message.send "Just cleared the notifications cache."

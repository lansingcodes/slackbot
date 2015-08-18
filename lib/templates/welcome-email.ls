require! {
  '../helpers/shorten-url'
  '../helpers/organizer-for'
  '../helpers/member-alias-for'
  '../helpers/first-name-for'
}

module.exports = (event, callback) ->

  organizer = organizer-for event.relationships.group.attributes

  email-subject = "#{event.name} Tonight!" |> encode-URI-component

  email-body = """
    <p>Fellow #{member-alias-for event.relationships.group.attributes},</p>

    <p>Thank you for your RSVP for tonight's 7pm meetup. We're going to have a great crowd! I'm pretty excited to see SOMETHING_EXCITING.</p>

    <p><strong>How to find us</strong></p>
    <p>If this is your first time and you need help getting to our group, be sure to park in <a href="https://www.google.com/maps/@42.734268,-84.480879,3a,75y,170.84h,85.88t/data=!3m6!1e1!3m4!1sd_i04cP0uHvJdD9MbRm6Zw!2e0!7i13312!8i6656">the MSU parking structure</a> across the street - it's free after 6pm! Then <a href="https://www.google.com/maps/@42.734483,-84.480627,3a,75y,29.57h,89.85t/data=!3m7!1e1!3m5!1sVPGJPxSePSIAAAQfCOpZDA!2e0!3e2!7i13312!8i6656">walk through these doors</a>, take the elevators at the end of the hall to the 3rd floor, and we'll be directly to your left when you exit the elevator.</p>
    <p>If you still need help, simply reply to this email or feel free to text or call Chris Fritz at (517) 803-9346.</p>

    <p><strong>What to bring</strong></p>
    <p>Many people choose to bring a laptop, as there are often opportunities to code along. If that's a pain, all you really need is yourself and an appetite for knowledge.</p>
    <p>As for attire, we're not even business casual - it's casual casual. Though you can wear a fancy dress or nice suit too. That would also be OK. :-)</p>

    <p><strong>Food and drink options</strong></p>
    <p>We'll have Cottage Inn pizza (plain cheese and usually also pepperoni), Chardonnay, Blue Moon, Sprite, and there's a water fountain where you can fill up a cup. If these options don't work for you, it's totally cool to bring something else for yourself.</p>

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

  welcome-template-link = "http://www.meetup.com/#{event.relationships.group.slug}/messages/send/?who=oneevent&eventId=#{event.attributes.id}&boards=1&subject=#{email-subject}&body=#{email-body}"

  shorten-url welcome-template-link, callback

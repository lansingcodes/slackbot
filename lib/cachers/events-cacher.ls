# Get the notifications cache, so that we don't keep notifying about the same
# meetups over and over again
module.exports = class EventsCacher

  (@robot) !->
    @notifications-cache = robot.brain.get(\notifications-cache) or {}

  cache: (event) !->
    # Update the cache to remember that we've already found this event
    @notifications-cache[event.attributes.id.to-string!] = true
    # Save the updated cache to lubot's persistent brain
    @robot.brain.set \notifications-cache, @notifications-cache

  # Checks if we've already notified about this event
  already-notified-regarding: (event) ->
    @notifications-cache[event.attributes.id.to-string!]

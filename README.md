# Lansing Codes Slackbot

[![Circle CI](https://circleci.com/gh/lansingcodes/slackbot.svg?style=svg)](https://circleci.com/gh/lansingcodes/slackbot)

You've found Lansing Codes's helpful, neighborhood robot! It runs as a member of
[our Slack](https://slack.lansing.codes/) and does a lot of cool stuff, like
notifying us of upcoming events and helping organizers do their work faster.

## Code of Conduct
All participants are expected to treat others with respect and follow our [Code of Conduct](https://www.lansing.codes/code-of-conduct/).

## Questions

For general support, direct your questions to the
[Lansing Codes Slack team](http://slack.lansing.codes). The issue list for this
project is exclusively for bug reports and feature requests.

## Stay in touch

- [Slack](http://slack.lansing.codes)
- [Twitter](https://twitter.com/lansingcodes)
- [Facebook](https://www.facebook.com/lansingcodes)
- [Website](https://www.lansing.codes)
- [Newsletter](http://bit.ly/lansing-codes-newsletter)

## Contribution

You are welcome and encouraged to make changes to this website by submitting
pull requests or forking our code to make your own community website!

Before you get ahead of yourself, though, please read our
[Contributing Guide](https://github.com/lansingcodes/slackbot/blob/main/.github/CONTRIBUTING.md).

## Running the bot locally

- Install Node.js 18 or newer.
- Copy `.env.example` to `.env` (create the file if it does not exist) and populate:
	- `HUBOT_SLACK_APP_TOKEN` – Slack App-Level token with `connections:write`.
	- `HUBOT_SLACK_BOT_TOKEN` – Bot token with the scopes listed below.
- (Optional) set `PORT` to expose Hubot's HTTP listener if needed.
- Start the bot with `npm install` followed by `npm start` or `bin/hubot`.

### Required Slack scopes and events

Grant the Slack app the following bot scopes to match production:

`app_mentions:read`, `channels:join`, `channels:history`, `channels:read`, `chat:write`, `im:write`, `im:history`, `im:read`, `users:read`, `groups:history`, `groups:write`, `groups:read`, `mpim:history`, `mpim:write`, `mpim:read`

Enable these Socket Mode events: `app_mention`, `message.channels`, `message.im`, `message.groups`, `message.mpim`.

## License

[Hippocratic 2.1](https://firstdonoharm.dev)

Copyright (c) 2015-Present, Michigan Technology Network

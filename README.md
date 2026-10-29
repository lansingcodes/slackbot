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

Install Node.js 24 (see `.nvmrc`) and run `npm ci`. Copy `.env.example` to an ignored `.env` file. Set `HUBOT_SLACK_APP_TOKEN` (Socket Mode app token), `HUBOT_SLACK_BOT_TOKEN`, and `FIREBASE_WEB_CONFIG` for the Firestore project written by `website`. Run `npm run start:local` to load `.env`, or `npm start` when the host provides environment variables. The Heroku web process uses `npm start`.

Notification history is stored in Firestore collection `slackbot_notifications`, so scheduled announcements survive Heroku restarts. On Heroku, set `FIREBASE_SERVICE_ACCOUNT` to JSON for a dedicated service account with Firestore read/write access to that project, or set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` separately. Do not set `NOTIFICATION_STORE=memory` on Heroku; that option is only for local development without an emulator. The local stack test uses the Firestore emulator and exercises a simulated restart. No website deployment change is required.

Before deploying, run `npm run preflight -- --expect-project YOUR_FIREBASE_PROJECT_ID --expect-team YOUR_SLACK_TEAM_ID` with the deployment environment variables loaded. It checks the expected project IDs, Slack bot identity, upcoming event reads, and persistent notification reads without posting a message. Add `--write-check` to write, read, and remove a unique notification record in that named project. Run this against a staging project first. The command does not validate the Socket Mode app token; use a live bot connection for that check.

Set `ORGANIZER_BY_GROUP`, `ORGANIZER_FIRST_NAME_BY_GROUP`, `WELCOMER_BY_CHANNEL`, `EVENT_ANNOUNCEMENT_CHANNEL_ID`, and `EVENT_GROUP_CHANNEL_IDS` for the deployed workspace. The old username and channel-name mappings remain as fallbacks. `APPROVED_TWEETER_IDS` restricts the optional X posting command to Slack user IDs; the four `TWITTER_*` variables supply the X app and user credentials. Keep all tokens outside the repository.

Run `npm test`, `npm run lint`, `npm run test:legacy`, and `npm audit --audit-level=low` before a PR. The unit and legacy smoke suites need no Slack or X credentials. The unit suite includes a full Hubot configuration check.

To rehearse the bot with the production website's Firestore SDK, check out `lansingcodes/website` beside this repository and run `npm ci` there. Install the Firebase CLI, then run `npm run test:stack`. Set `STACK_WEBSITE_PACKAGE` to the website's `package.json` if it is elsewhere, and `FIREBASE_BIN` if the CLI is not on `PATH`. The test uses only a local Firestore emulator and demo data. For end-to-end acceptance, test the bot in a separate Slack workspace with representative Firestore events before deploying to Heroku.

### Required Slack scopes and events

Grant the Slack app the following bot scopes to match production:

`app_mentions:read`, `channels:join`, `channels:history`, `channels:read`, `chat:write`, `im:write`, `im:history`, `im:read`, `users:read`, `groups:history`, `groups:write`, `groups:read`, `mpim:history`, `mpim:write`, `mpim:read`

Enable these Socket Mode events: `app_mention`, `message.channels`, `message.im`, `message.groups`, `message.mpim`.

## License

[Hippocratic 2.1](https://firstdonoharm.dev)

Copyright (c) 2015-Present, Michigan Technology Network

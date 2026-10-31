# Slackbot modernization and verification

This PR upgrades the existing Hubot bot while keeping its event, onboarding, room-reference, help, and optional X posting behavior. It targets `main` and keeps Heroku as the bot host. The bot reads Firestore collections written by the production `website` repository; the retired `api` repository is not a deployment dependency.

## Runtime and dependencies

- Node 24, Hubot 14, and `@hubot-friends/hubot-slack` Socket Mode replace the old RTM adapter.
- Firebase 13, Firebase Admin 14 for durable notification history, and patched dependencies replace vulnerable packages. The X command uses the X v2 Post API. The old TinyURL package is replaced by an HTTPS request with a fallback to the original URL.
- `hubot-appearin`, `hubot-maps`, and `hubot-shipit` are replaced by local video-room, Google Maps URL, and HTTPS shipit commands. The remaining CoffeeScript packages load through a compatibility loader.
- The deprecated external Heroku keepalive package is replaced by the internal initializer from this PR. Set `HUBOT_HEROKU_KEEPALIVE_URL` or `HEROKU_URL` to enable it; set `HUBOT_HEROKU_KEEPALIVE_INTERVAL=0` to disable it.

## Local checks

Use Node 24 and run:

```sh
npm ci
npm run lint
npm test
npm run test:legacy
npm run test:stack
npm audit --audit-level=low
```

The unit suite includes a process-level `--config-check` that fails on script-loading errors even when Hubot exits successfully. The legacy smoke suite exercises representative commands through a local Hubot adapter. Both suites run without Slack or X credentials.

The optional stack test runs a local Firestore emulator with the sibling `website` checkout's Firebase Admin SDK. It verifies event lookup, group replies, scheduled announcements, persistence across a simulated bot restart, channel references, join notices, and X authorization with demo data. The combined website, Slackbot, and newsletter integration was also checked separately with an emulator. Repeat these tests after changes to the Firestore schema.

## Notification delivery recovery

Each scheduled event message claims a document in `slackbot_notifications` before posting. A successful Slack response marks it `delivered`. An explicit Slack rejection releases the claim so the next scheduled run can retry. A network error or crash can leave a document `uncertain` or `pending`; the bot will skip that message and log a warning rather than risk a duplicate. Slack posting and Firestore recording cannot be one atomic operation.

For a `pending` or `uncertain` document, an admin should inspect the target Slack channel for the event message before changing Firestore. If the message is present, mark the document `status: delivered` and add `recordedAt`. If it is definitely absent, delete that one notification document to allow a retry. Leave it unchanged and investigate if delivery cannot be determined. Do not clear the whole collection. The local stack smoke test checks concurrent bot processes, explicit rejection, and uncertain delivery against the emulator.

## Deployment acceptance

1. In a non-production Slack workspace, confirm the app has the documented Socket Mode scopes and channel memberships. Check event replies, announcements, joins, references, reconnection, and every retained command.
2. Add a dedicated Firestore service account with read/write access to the existing project as a Heroku config var (`FIREBASE_SERVICE_ACCOUNT`), or set the three individual Admin credential variables documented in the README. Confirm `NOTIFICATION_STORE` is not set to `memory` on Heroku. Restart the bot and check that reminders are not repeated.
3. Verify the production `website` Firestore schema and current organizer, welcomer, announcement-channel, and approved-tweeter IDs.
4. Set Heroku config vars without committing tokens. Confirm the web process starts, reconnects, and recovers after restart. Keep the website's Netlify deploy separate from the bot's Heroku deploy.
5. Obtain maintainer review before merging. Production credentials and deployment have not been exercised by this PR.

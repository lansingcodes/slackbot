# Security Upgrade Plan

This document outlines the remediation steps needed to resolve the remaining npm vulnerabilities after PRs #85, #95, and #96.

## 1. Replace Deprecated Slack Adapter

- Swap `hubot-slack` for `@hubot-friends/hubot-slack`.
- Upgrade Hubot core to `^13.1.4` and adjust startup commands (Procfile, README) to use `hubot -a @hubot-friends/hubot-slack`.
- Require new env vars `HUBOT_SLACK_APP_TOKEN` and `HUBOT_SLACK_BOT_TOKEN`; document Socket Mode scopes/events.
- Refactor Slack-specific initializers/tests to remove dependencies on the legacy RTM client (notably `mentioned-rooms-referencer` and `watch-for-disconnected`).

## 2. Remove Vulnerable Legacy Helpers

- Drop unused `google-url` and `expand-url` dependencies to eliminate their transitively vulnerable `request`/`form-data` chain.
- Update `lib/templates/welcome-email.js` and its specs to stub `shorten-url` instead of making live shortening calls.

## 3. Upgrade Firebase SDK

- Bump `firebase` to `^12.4.0` to pick up patched `@grpc/grpc-js`.
- Verify Firestore usage (`events-fetcher`) against new APIs and adjust if necessary.

## 4. Modernize Tooling

- Update `standard` to `^17` (and any transitive lint deps).
- Add Node engine constraint `>=18`.
- Update CircleCI workflow to run `npm run lint && npm test`.

## 5. Verification

- Blow away lockfile and reinstall: `rm -rf node_modules package-lock.json && npm install`.
- Run `npm run lint`, `npm test`, and `npm audit --omit=dev`.
- ✅ `npm run lint`
- ✅ `npm test`
- ✅ `npm audit --omit=dev`
- Perform manual smoke tests in Slack (help command, channel mention notification, reconnect behavior, tweeting).
	- Partial: Hubot boots locally with the new adapter; startup now halts at Slack authentication because placeholder `SLACK_APP_TOKEN` / `SLACK_BOT_TOKEN` were used. Re-run with production Socket Mode tokens to complete verification.

## 6. Follow-Up

- Capture migration instructions in README.
- Determine if any remaining vulnerabilities stem from third-party Hubot scripts and file follow-up issues if they cannot be patched immediately.

## 7. Slack Token Preparation & Sandbox Testing

1. Create (or reuse) a Slack workspace dedicated to testing at <https://slack.com/create>. The free plan is sufficient and avoids touching production data while verifying Socket Mode behavior.
2. Build a Slack app for that workspace via <https://api.slack.com/apps>:
   - Enable **Socket Mode**.
   - Generate an **App-Level Token** with the `connections:write` scope (this becomes `SLACK_APP_TOKEN`).
   - Under **OAuth & Permissions**, add the required bot scopes (`app_mentions:read`, `channels:history`, `chat:write`, `groups:history`, `im:history`, `mpim:history`, `reactions:read`, `reactions:write`, etc.) and reinstall the app to capture the refreshed Bot User OAuth token (`SLACK_BOT_TOKEN`).
3. Store those tokens in a local `.env` (never commit them):

   ```bash
   SLACK_APP_TOKEN=xapp-...
   SLACK_BOT_TOKEN=xoxb-...
   ```

4. Run a local smoke test with the sandbox tokens: `bash bin/hubot --adapter @hubot-friends/hubot-slack`. Confirm the adapter connects (look for "Connected to Slack" in the logs) and exercise key commands (help, channel mention notifications, reconnect behavior, tweeting).
5. After approvals, repeat the token creation steps in the production workspace, update deployment secrets (e.g., Heroku config vars), and re-run the smoke test against production.

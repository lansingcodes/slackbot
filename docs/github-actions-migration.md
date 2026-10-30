# GitHub Actions migration

The workflow in `.github/workflows/build-and-deploy.yml` runs on every push and
pull request. It uses Node 24, installs and rebuilds dependencies, and runs lint,
unit tests, legacy command checks, and the dependency audit. It needs no Slack,
Firebase, X, or Heroku secret for those checks.

## Administrator setup before enabling production deployment

1. Review the PR's GitHub Actions build result and this repository's branch
   protection rules. Make the new `build` check required after it has run on
   `main`.
2. Create the GitHub Actions environment `production`. Restrict deployments to
   `main` and add required reviewers if desired.
3. In that environment, set variable `HEROKU_APP_NAME` to the **existing
   production app's name** and secret `HEROKU_API_KEY` to a token from an account
   authorized to deploy that app. Keep these values out of source and PR text.
4. Confirm the Heroku app still has its production Slack, Firestore, and other
   config vars. The workflow only deploys code; it does not create or change
   those values or scale dynos.
5. Stop CircleCI's old deploy path. Then set repository variable
   `HEROKU_DEPLOY_ENABLED` to `true`. Until that exact value is set, pushes to
   `main` run tests but skip deployment.
6. Merge a small, reviewed `main` change and confirm the deploy job publishes
   that commit to the intended Heroku app. Check the release, process status,
   logs, and Slack behavior before removing any remaining CircleCI integration.

The deploy job requires a successful build, an exact `main` push in
`lansingcodes/slackbot`, and the enable variable. PRs and fork events never get
the Heroku credentials. The `production` environment can enforce an additional
approval or branch restriction. The job pushes the checked-out commit to Heroku
Git's `main` branch; Heroku Git is a deployment transport, so the push may need
to replace its previous ref. The script writes the token into a temporary
owner-only `.netrc` and removes it when the push finishes.

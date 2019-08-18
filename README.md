# Lansing Codes Slackbot

[![Circle CI](https://circleci.com/gh/lansingcodes/lubot.svg?style=svg)](https://circleci.com/gh/lansingcodes/lubot)

You've found Lansing Codes's helpful, neighborhood robot! It runs as a member of
[our Slack](https://slack.lansing.codes/) and does a lot of cool stuff, like
notifying us of upcoming events and helping organizers do their work faster.

## Running lubot Locally

You can start lubot locally by running:

``` sh
DEBUG=true ./bin/hubot
```

You'll see some start up output and a prompt:

```
[Sat Feb 28 2015 12:38:27 GMT+0000 (GMT)] INFO Using default redis on localhost:6379
lubot>
```

Then you can interact with lubot by typing `lubot help`.

```
lubot> lubot help
lubot animate me <query> - The same thing as `image me`, except adds [snip]
lubot help - Displays all of the help commands that lubot knows about.
...
```

## Configuration

A few scripts (including some installed by default) require environment
variables to be set as a simple form of configuration.

Here's a list of the environment variables used in production.

### `FIREBASE_WEB_CONFIG` (required)

The Slackbot gets Lansing Codes data (events, groups, etc.) from the public
[Lansing Codes Firebase data store](https://github.com/lansingcodes/api). This
data can be accessed using a stringified version of the data store's JSON
configuration, which is listed on the Lansing Codes API page.

### `HUBOT_HEROKU_KEEPALIVE_URL` (required for Heroku free plan)

The Lansing Codes Slackbot runs in a free Heroku plan and to keep it free, we
use the [hubot-heroku-keepalive](https://github.com/hubot-scripts/hubot-heroku-keepalive)
script to keep the bot awake no more than 18 hours per day.

The documentation for the keepalive script explains how to determine the value
of `HUBOT_HEROKU_KEEPALIVE_URL`, other environments variables (which we don't
use), and the Heroku scheduler to wake up the bot every morning.

### `HUBOT_SLACK_TOKEN` (required in production)

This value is generated when the [Hubot integraction](https://slack.dev/hubot-slack/)
is enabled by a Slack administrator. The linked documentation explains how to
get the token and configure your own Slackbot.

One gotcha with the Slack token: only the administrator who turned on the
integration can see the value of the token once it's generated. If you have
multiple administrators configuring the Slackbot, put the token in a secure
place where it can be shared, such as LastPass.

### `REDISCLOUD_URL` (optional)

If available, the Slackbot will use Redis to cache information. In Heroku,
simply turn on the [Redis Cloud add-on](https://devcenter.heroku.com/articles/rediscloud)
to automatically set this environment variable and start using Redis. The free
version of the add-on is sufficient for the Slackbot's needs.

### `TWITTER_*` (optional)

If you want the Slackbot to automatically interact with a community Twitter
account such as [@lansingcodes](https://twitter.com/lansingcodes), four
environments variables must be set:

- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`
- `TWITTER_CONSUMER_KEY`
- `TWITTER_CONSUMER_SECRET`

The values are all available on the _Keys and Tokens_ tab after you create a
[Twitter app](https://developer.twitter.com/en/apps) in the appropriate Twitter
account.

### `TZ` (required for Heroku free plan)

In addition to setting `HUBOT_HEROKU_KEEPALIVE_URL`, you should also set the
`TZ` (timezone) for your Slackbot so the bot is awake and sharing information
in the same timezone as your community.

Lansing Codes is in the `America/New_York` timezone.

## Scripting

If you're completely new to hubot scripting, take a look at the
[Hubot Scripting Guide](https://github.com/github/hubot/blob/master/docs/scripting.md).

It's worth noting that this particular hubot project is organized differently
from most others. Instead of a simple `scripts` directory, everything is
organized in a `lib` directory, which itself is organized into sub-directories:

- Traditional hubot scripts are in `initializers` and run when hubot starts.
- Data fetchers are in `fetchers`.
- Scheduled tasks are in `scheduled-tasks`. To schedule one of these scripts,
  register it as a cron job in `initializers/scheduler.ls`.
- Templates (emails, for example) are in `templates`.
- General helper functions are `helpers`.

This structure allows scripts to be written in any language that can transpile
to JavaScript and currently you will find a mix of CoffeeScript, LiveScript,
and JavaScript.

We are trying to migrate everything to JavaScript to make our bot as simple as
possible so if you want to make improvements, one way is to convert a script to
JavaScript. 😉

## External scripts

There will inevitably be functionality that everyone will want. Instead of
writing it yourself, you can use existing plugins.

Hubot is able to load plugins from third-party `npm` packages. This is the
recommended way to add functionality to hubot. You can get a list of
available hubot plugins on [npmjs.com](npmjs) or by using `npm search`:

```
$ npm search hubot-scripts panda
NAME             DESCRIPTION                        AUTHOR DATE       VERSION KEYWORDS
hubot-pandapanda a hubot script for panda responses =missu 2014-11-30 0.9.2   hubot hubot-scripts panda
...
```

To use a package, check the package's documentation, but in general it is:

1. Use `npm install --save` to add the package to `package.json` and install it
2. Add the package name to `external-scripts.json` as a quoted string

You can review `external-scripts.json` to see what is included by default.

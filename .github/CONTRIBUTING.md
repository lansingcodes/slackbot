# Lansing Codes Contributing Guide

Hi! We're really excited that you are interested in contributing to our tech
community tools. Before submitting your contribution, please make sure to read
through these guidelines.

- [Code of Conduct](https://www.lansing.codes/code-of-conduct/)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Running slackbot locally](#running-slackbot-locally)
- [Configuration](#configuration)
- [Scripting](#scripting)
- [External scripts](#external-scripts)
- [Build scripts](#build-scripts)
- [Deployments](#deployments)

## Issue Reporting Guidelines

- If you would like to report a bug, use the
  [Bug report](https://github.com/lansingcodes/slackbot/issues/new?labels=bug&template=bug_report.md)
  template and fill in all of the details to the best of your abilities.

- If you would like to request a new feature, use the
  [Feature request](https://github.com/lansingcodes/slackbot/issues/new?labels=enhancement&template=feature_request.md)
  template. Provide as many details as possible, including visual mockups of the
  feature, descriptions of new user interactions, and an explanation of the
  benefits of the feature.

## Pull Request Guidelines

- The `main` branch is a snapshot of the latest production release. All
  development should be done in dedicated branches.

- Checkout a development branch from the `main` branch. Similarly submit pull
  requests back to the `main` branch.

- Add your name (and optional email and website) to the `contributors` property
  in `package.json`. We want people to know you're helping out!

- If adding a new feature, first create an issue with the `enhancement` label.
  Provide convincing reason to add this feature, provide mockups, and ask for
  discussion about the feature from other contributors. Wait until at least one
  administrator has greenlighted the feature before working on it.

- If fixing a bug:
  - Add `(fixes #xxxx)` (where #xxxx is the issue id) to your PR title. For
    example, `add script to show group organizers (fixes #12)`.
  - Provide a detailed description of the bug in the pull request.

- If your change depends on or is a dependency of changes in another project,
  such as [lansingcodes/api](https://github.com/lansingcodes/api)), please
  make a note of this dependency and reference the pull request id in the
  corresponding project(s).

- Assign one or more reviewers to the pull request. At least one reviewer must
  approve the changes before the PR can be merged.

## Development Setup

If you want to run the slackbot and make changes to it on your computer, some
initial setup is recommended.

This section starts with the basics like git and even the recommended editor.
There may be useful information here even if you're already familiar with
using git, VS Code, and Node. If you want to jump ahead, though, please read the
section about [Configuration](#configuration).

You'll run all of the commands provided in this guide in a terminal program
(Terminal, Git Bash, etc.).

### Required software

If you're comfortable with using git, a terminal, node (npm), and VS Code,
here's a quick list of the tools you'll need to run this project:

- [git](https://git-scm.com/downloads)
- [node and npm](https://nodejs.org/), although
  [nvm](https://github.com/nvm-sh/nvm) is recommended for non-Windows users
- [Visual Studio Code](https://code.visualstudio.com/) with these extensions:
  - Bracket Pair Colorizer by CoenraadS
  - [StandardJS](https://marketplace.visualstudio.com/items?itemName=chenxsan.vscode-standardjs) by Sam Chen
  - Node.js Extension Pack by Wade Anderson
  - npm by egamma
  - npm Intellisense by Christian Kohler
  - Path Autocomplete by Mihai Vilcu
  - Path Intellisense by Christian Kohler
  - VSCode Essentials Snippets by Roberto Achar

### Getting the source code

If you want to start your own community Slackbot, click the _Fork_ button in the
top right of the
[`lansingcodes/slackbot`](https://github.com/lansingcodes/slackbot) page on
GitHub. This will create your own copy of the code, allow you to get updates 
from us, and make it easier to send us helpful improvements that you've made.

To get the code from GitHub, you will need to install
[`git`](https://git-scm.com/downloads) on your computer and then run `git clone`
to download the code from your computer.

If you are making changes to `lansingcodes/slackbot`, the full command will look
like this:

``` sh
git clone https://github.com/lansingcodes/slackbot.git
```

If you forked this repository, the command will be different. Go to the page
where your copy of the code exists on GitHub and then click the _Clone or
download_ button to get the URL of the repository. Then run the following
command, substituting `REPOSITORY_URL` with the URL shown when you clicked the
_Clone or download_ button on your repository:

``` sh
git clone REPOSITORY_URL
```

### Installing NodeJS

This website is built with [NodeJS](https://nodejs.org/). If you are a Windows
user, download and install Node by following the link and select the _LTS_
download.

If you use macOS or Linux, we recommend using
[`nvm`](https://github.com/nvm-sh/nvm) to install Node. Once `nvm` is installed,
you can installed, you can run the following command to install the correct Node
version:

``` sh
nvm install lts/dubnium
```

And then use that version of Node in your terminal by running:

``` sh
nvm use lts/dubnium
```

### Installing dependencies

Now that NodeJS is installed, we can use it's companion, `npm`, to install all
of the required packages to run this project.

In a terminal, change to this projects directory and run the following command
to install the dependencies:

``` sh
npm install
```

### Editing the code

If you want to look at the code and make changes to it, we highly recommend
using [Visual Studio Code](https://code.visualstudio.com/) (VS Code for short).
Follow the link to download and install the code editor.

After VS Code is installed, run it and click _Extensions_ from the gear icon
menu in the lower left of the editor. This will bring up a panel with a search
box.

Use the search box to find and install all of these extensions. They make the
experience of looking at and editing this project _super nice_.

- Bracket Pair Colorizer by CoenraadS
- [StandardJS](https://marketplace.visualstudio.com/items?itemName=chenxsan.vscode-standardjs) by Sam Chen
- Node.js Extension Pack by Wade Anderson
- npm by egamma
- npm Intellisense by Christian Kohler
- Path Autocomplete by Mihai Vilcu
- Path Intellisense by Christian Kohler
- VSCode Essentials Snippets by Roberto Achar

You should probably restart VS Code after installing all of these extensions.

### Making changes

That's it for required software! You should now be able to run `bin/hubot` or
`bin/hubot.cmd` in a terminal to build and run the bot on the command line.
Try chatting a bit, or `slackbot help` to see what scripts are available.

Code style is [JavaScript Standard Style](https://standardjs.com/index.html).
Please check your code with `npm run lint` as you develop. You can run
`npm run fix` to attempt to automatically fix style issues that are detected.

If you're making changes to the code and want to send a pull request to the
`lansingcodes` organization on GitHub, the easiest way is to make all of your
changes in a feature branch.

To create a feature branch, use these commands, replacing `new-branch` with the
name of your feature:

``` sh
git fetch origin
git checkout -b new-branch origin/main
```

After you've made and tested your changes, these commands are helpful for
committing your changes to your branch. Again, substitute `new-branch` with the
name of your branch and `describe your changes` with an actual description of
your changes. If you send us commits with messages that aren't descriptive then
we won't accept them.

``` sh
git add -A
git commit -m 'describe your changes'
git push origin new-branch
```

The output from this command will give you a link to GitHub that will start a
pull request. Complete the form and submit your changes. Someone will get to it
as soon as we can.

If you want to use a different Firebase database on your computer or want to
do more advanced things with your project, you may find the following sections
helpful.

We hope you enjoy working with our code!

## Running slackbot locally

You can start slackbot locally by running:

``` sh
DEBUG=true ./bin/hubot
```

You'll see some start up output and a prompt:

```
[Sat Feb 28 2015 12:38:27 GMT+0000 (GMT)] INFO Using default redis on localhost:6379
slackbot>
```

Then you can interact with slackbot by typing `slackbot help`.

```
slackbot> slackbot help
slackbot animate me <query> - The same thing as `image me`, except adds [snip]
slackbot help - Displays all of the help commands that slackbot knows about.
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
  register it as a cron job in `initializers/scheduler`.
- Templates (emails, for example) are in `templates`.
- General helper functions are `helpers`.

This structure allows scripts to be written in any language that can transpile
to JavaScript.

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

## Build scripts

`npm` is the tool used to initiate all of the build setup and steps for this
project. All scripts can be found in `package.json`.

To install dependencies, run:

```sh
npm install
```

To run unit tests, use the script below. When making changes, please make sure
to add tests for your own code as well as making sure to fix or update existing
tests!

```sh
npm run test
```

To detect code style issues, run:
```sh
npm run lint
```

To attempt to automatically fix those code style issues where possible, run:
```sh
npm run fix
```

To check that everything's styled correctly and passes tests before committing, run:
```sh
npm run precommit
```

## Deployments

After a pull request is reviewed and merged to `main`, the changes will be
built and verified on [CircleCI](https://circleci.com/gh/lansingcodes/slackbot)
automatically before being deployed to Heroku.

The primary Humanity Codes account has administrator access to both CircleCI
and Heroku. Additional administrators can be added by invitation only.

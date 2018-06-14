# lubot

[![Circle CI](https://circleci.com/gh/lansingcodes/lubot.svg?style=svg)](https://circleci.com/gh/lansingcodes/lubot) [![Dependency Status](https://gemnasium.com/lansingcodes/lubot.svg)](https://gemnasium.com/lansingcodes/lubot)

lubot is Lansing Codes's helpful, neighborhood robot. It lives on [our Slack](http://lansingcodes.slack.com/) and does a lot of cool stuff, like notifying us of upcoming, code-related events and helping meetup organizers get their work done faster.

## TODO

If you'd like to help improve lubot, here are some features we'd like to add. These are ordered by level of estimated time and difficulty, starting with the shortest and simplest.

- Update dependencies
- Add proper documentation to available commands, [in this format](https://github.com/github/hubot/blob/master/docs/scripting.md#documenting-scripts), so that `lubot help` will properly return info on what lubot can do.
- Return a list of upcoming and nearby conferences from a specific keyword. [Like this](http://lanyrd.com/search/?q=devops&places=midwestern-usa%2Cusa&context=future). Maybe get this info from Lanyrd? As a possible trigger, maybe have it run on `<keyword> conferences`?

## Running lubot Locally

You can start lubot locally by running:

```
$ bin/hubot
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

Each script should have a commented header which contains a "Configuration"
section that explains which values it requires to be placed in which variable.
When you have lots of scripts installed this process can be quite labour
intensive. The following shell command can be used as a stop gap until an
easier way to do this has been implemented.

```
grep -o 'hubot-[a-z0-9_-]\+' external-scripts.json | \
  xargs -n1 -I {} sh -c 'sed -n "/^# Configuration/,/^#$/ s/^/{} /p" \
      $(find node_modules/{}/ -name "*.coffee")' | \
    awk -F '#' '{ printf "%-25s %s\n", $1, $2 }'
```

How to set environment variables will be specific to your operating system.
Rather than recreate the various methods and best practices in achieving this,
it's suggested that you search for a dedicated guide focused on your OS.

## Scripting

If you're completely new to hubot scripting, I recommend their [Scripting Guide](https://github.com/github/hubot/blob/master/docs/scripting.md).

It's worth noting that this particular hubot project is organized differently from most others. Instead of a simple `scripts` directory, everything is organized in a `lib` directory, which itself is organized into sub-directories:

- Traditional hubot scripts are in `initializers` and are run when hubot starts.
- Fetchers to api.lansing.codes are in `fetchers`.
- Scheduled tasks are in `scheduled-tasks`. It should be noted that to actually schedule that task, you'll need to register it as a cron job in `initializers/scheduler.ls`.
- Templates (for emails, for example) are in `templates`.
- General helper functions are `helpers`.

One significant advantage to this organization is that we can write not only in JavaScript and CoffeeScript, but *anything* that transpiles to JavaScript, including LiveScript and Babel. The vast majority of this project is actually written in LiveScript.

## external-scripts

There will inevitably be functionality that everyone will want. Instead of
writing it yourself, you can use existing plugins.

Hubot is able to load plugins from third-party `npm` packages. This is the
recommended way to add functionality to your hubot. You can get a list of
available hubot plugins on [npmjs.com](npmjs) or by using `npm search`:

```
$ npm search hubot-scripts panda
NAME             DESCRIPTION                        AUTHOR DATE       VERSION KEYWORDS
hubot-pandapanda a hubot script for panda responses =missu 2014-11-30 0.9.2   hubot hubot-scripts panda
...
```

To use a package, check the package's documentation, but in general it is:

1. Use `npm install --save` to add the package to `package.json` and install it
2. Add the package name to `external-scripts.json` as a double quoted string

You can review `external-scripts.json` to see what is included by default.

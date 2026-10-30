#!/usr/bin/env bash
set -euo pipefail

: "${HEROKU_APP_NAME:?Set HEROKU_APP_NAME to the existing Heroku app name}"
: "${HEROKU_API_KEY:?Set HEROKU_API_KEY to a Heroku API token}"

if [[ ! "$HEROKU_APP_NAME" =~ ^[a-z][a-z0-9-]{1,28}[a-z0-9]$ ]]; then
  echo 'HEROKU_APP_NAME is not a valid Heroku app name.' >&2
  exit 1
fi

credentials_dir="$(mktemp -d)"
trap 'rm -rf "$credentials_dir"' EXIT
umask 077
printf 'machine git.heroku.com\n  login _\n  password %s\n' "$HEROKU_API_KEY" > "$credentials_dir/.netrc"

HOME="$credentials_dir" GIT_TERMINAL_PROMPT=0 git push --force \
  "https://git.heroku.com/${HEROKU_APP_NAME}.git" HEAD:main

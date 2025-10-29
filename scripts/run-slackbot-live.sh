#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

prompt_for_secret() {
  local prompt="$1"
  local result
  read -r -s -p "$prompt" result
  echo
  printf '%s' "$result"
}

if [[ -z "${HUBOT_SLACK_TOKEN:-}" ]];
then
  HUBOT_SLACK_TOKEN="$(prompt_for_secret "Enter Slack bot token (xoxb-...): ")"
fi

if [[ -z "${HUBOT_SLACK_TOKEN:-}" ]];
then
  echo "error: HUBOT_SLACK_TOKEN is required to run against live Slack." >&2
  exit 1
fi

if [[ -z "${FIREBASE_WEB_CONFIG:-}" ]];
then
  read -r -p "Optionally paste FIREBASE_WEB_CONFIG JSON (press Enter to skip): " FIREBASE_WEB_CONFIG
fi

if [[ -z "${HUBOT_HEROKU_KEEPALIVE_URL:-}" ]];
then
  read -r -p "Optional HUBOT_HEROKU_KEEPALIVE_URL (press Enter to skip): " HUBOT_HEROKU_KEEPALIVE_URL
fi

if [[ ! -d "${ROOT_DIR}/node_modules" ]];
then
  echo "Installing npm dependencies (set SKIP_NPM_INSTALL=1 to skip)."
  npm install
fi

export HUBOT_SLACK_TOKEN
export DEBUG="${DEBUG:-true}"
export HUBOT_HTTPD="${HUBOT_HTTPD:-false}"

if [[ -n "${FIREBASE_WEB_CONFIG:-}" ]];
then
  export FIREBASE_WEB_CONFIG
fi

if [[ -n "${HUBOT_HEROKU_KEEPALIVE_URL:-}" ]];
then
  export HUBOT_HEROKU_KEEPALIVE_URL
fi

export PATH="${ROOT_DIR}/node_modules/.bin:${PATH}"

cleanup() {
  unset HUBOT_SLACK_TOKEN
  unset FIREBASE_WEB_CONFIG
  unset HUBOT_HEROKU_KEEPALIVE_URL
  unset DEBUG
  unset HUBOT_HTTPD
}
trap cleanup EXIT

echo "Starting Hubot against live Slack. Press Ctrl+C to stop."
"${ROOT_DIR}/bin/hubot" --adapter slack "$@"

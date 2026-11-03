#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
website_package="${STACK_WEBSITE_PACKAGE:-$root/../website/package.json}"
firebase_bin="${FIREBASE_BIN:-$(command -v firebase || true)}"

if [[ "$(node -p 'process.versions.node.split(".")[0]')" != 24 ]]; then
  echo 'The stack smoke test needs Node 24 (see .nvmrc).' >&2
  exit 1
fi
if [[ ! -f "$website_package" ]]; then
  echo 'Set STACK_WEBSITE_PACKAGE to a sibling website/package.json with installed dependencies.' >&2
  exit 1
fi
if [[ -z "$firebase_bin" ]]; then
  echo 'Install the Firebase CLI and set FIREBASE_BIN to its executable.' >&2
  exit 1
fi

cd "$root"
STACK_WEBSITE_PACKAGE="$website_package" "$firebase_bin" emulators:exec \
  --only firestore \
  --project demo-lansingcodes \
  --config firebase.json \
  'node dev-tools/local-stack-smoke.js && node dev-tools/notification-restart-smoke.js'

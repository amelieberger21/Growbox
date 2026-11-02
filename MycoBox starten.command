#!/bin/zsh
set -e
cd "${0:A:h}"

if command -v npm >/dev/null 2>&1; then
  if [ ! -d node_modules ]; then npm ci; fi
  exec npm run dev -- --open
fi

mycobox_runtime="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if [ -x "$mycobox_runtime/node/bin/node" ]; then
  export PATH="$mycobox_runtime/node/bin:$PATH"
  if [ ! -d node_modules ]; then
    "$mycobox_runtime/bin/fallback/pnpm" install --store-dir ./work/pnpm-store
  fi
  exec "$mycobox_runtime/node/bin/node" node_modules/vite/bin/vite.js --host 127.0.0.1 --open
fi

print 'Bitte installiere Node.js (ab 22.12, empfohlen 24 LTS) und starte diese Datei erneut.'
read -r '?Zum Schließen Enter drücken.'

#!/bin/bash
set -euo pipefail

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
PROJECT_DIR="$(cd "$(dirname "$0")/earplay" && pwd)"
URL="http://127.0.0.1:5187"
STATE_DIR="${TMPDIR:-/tmp}/earplay-$(id -u)-$(printf '%s' "$PROJECT_DIR" | shasum | cut -c1-12)"
mkdir -p "$STATE_DIR"

fail() {
  printf '\n%s\n' "$1"
  if [ -f "$STATE_DIR/server.log" ]; then
    tail -n 20 "$STATE_DIR/server.log"
  fi
  printf '\nPress Return to close.'
  read -r _ || true
  exit 1
}

command -v node >/dev/null 2>&1 || fail "Node.js is needed to launch Earplay."
cd "$PROJECT_DIR"
if [ ! -f node_modules/vite/bin/vite.js ]; then
  printf 'Installing Earplay dependencies…\n'
  npm ci || fail "Could not install Earplay dependencies."
fi

SERVER_PID=""
if [ -f "$STATE_DIR/server.pid" ]; then
  SERVER_PID="$(cat "$STATE_DIR/server.pid")"
fi
if [[ "$SERVER_PID" =~ ^[0-9]+$ ]] && ps -p "$SERVER_PID" -o command= | grep -Fq "$PROJECT_DIR/node_modules/vite/bin/vite.js"; then
  printf 'Opening Earplay…\n'
else
  printf 'Starting Earplay…\n'
  nohup node "$PROJECT_DIR/node_modules/vite/bin/vite.js" --host 127.0.0.1 --port 5187 --strictPort >"$STATE_DIR/server.log" 2>&1 </dev/null &
  SERVER_PID=$!
  printf '%s\n' "$SERVER_PID" > "$STATE_DIR/server.pid"
fi

for ((attempt=0; attempt<60; attempt++)); do
  kill -0 "$SERVER_PID" 2>/dev/null || fail "Earplay could not start."
  if curl --silent --fail "$URL/@vite/client" >/dev/null; then
    open "$URL"
    printf 'Earplay is open. You can close this Terminal window.\n'
    exit 0
  fi
  sleep 0.5
done
fail "Earplay took too long to start. Try opening the launcher again."

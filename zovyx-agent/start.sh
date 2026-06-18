#!/usr/bin/env bash
# start.sh - Preconfigured single-command launcher for Zovyx dev environment.
# Starts the gateway server + Control UI with zero manual config.
# Usage: ./start.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Zovyx Dev Launcher"
echo ""

# ---------------------------------------------------------------------------
# 1. Run setup-env.sh to ensure config is ready (idempotent)
# ---------------------------------------------------------------------------
if [ -f "$SCRIPT_DIR/setup-env.sh" ]; then
  echo "  [setup] Applying environment configuration..."
  bash "$SCRIPT_DIR/setup-env.sh"
  echo ""
fi

# ---------------------------------------------------------------------------
# 2. Start the gateway server in background
# ---------------------------------------------------------------------------
echo "  [gateway] Starting Zuvix gateway (dev mode)..."
LOG_FILE="${ZUVIX_STATE_DIR:-$HOME/.zuvix}/gateway-dev.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Generate a gateway token if missing
if ! grep -q '^ZUVIX_GATEWAY_TOKEN=[^# ]' "$SCRIPT_DIR/.env" 2>/dev/null; then
  TOKEN=$(openssl rand -hex 32)
  echo "ZUVIX_GATEWAY_TOKEN=$TOKEN" >> "$SCRIPT_DIR/.env"
  echo "  [gateway] Generated gateway token"
fi

source "$SCRIPT_DIR/.env" 2>/dev/null || true

# Start gateway via the dev script
node "$SCRIPT_DIR/scripts/run-with-env.mjs" \
  ZUVIX_SKIP_CHANNELS=1 \
  -- \
  node "$SCRIPT_DIR/scripts/run-node.mjs" --dev gateway \
  > "$LOG_FILE" 2>&1 &
GATEWAY_PID=$!
echo "  [gateway] PID $GATEWAY_PID (log: $LOG_FILE)"

# Wait for gateway to be ready
echo "  [gateway] Waiting for gateway to start..."
for i in $(seq 1 30); do
  if curl -s --max-time 1 http://127.0.0.1:18789/health 2>/dev/null | grep -q .; then
    echo "  [gateway] Ready (ws://127.0.0.1:18789)"
    break
  fi
  if ! kill -0 "$GATEWAY_PID" 2>/dev/null; then
    echo "  [gateway] ERROR: Gateway exited prematurely. Check $LOG_FILE"
    exit 1
  fi
  sleep 1
done

# ---------------------------------------------------------------------------
# 3. Start Control UI in foreground
# ---------------------------------------------------------------------------
echo ""
echo "  [ui] Starting Control UI..."
echo ""
echo "  === Dashboard: http://localhost:5173 ==="
echo "  === Gateway:   ws://127.0.0.1:18789 ==="
echo ""

cleanup() {
  echo ""
  echo "  [cleanup] Stopping gateway (PID $GATEWAY_PID)..."
  kill "$GATEWAY_PID" 2>/dev/null || true
  wait "$GATEWAY_PID" 2>/dev/null || true
  echo "  [cleanup] Done"
}
trap cleanup EXIT INT TERM

cd "$SCRIPT_DIR/ui"
npx vite --port 5173 --host 0.0.0.0

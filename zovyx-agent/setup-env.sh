#!/usr/bin/env bash
# setup-env.sh - Configure local Zovyx dev environment with secure bypasses
# Usage: source setup-env.sh
#   or:  ./setup-env.sh  (then restart the gateway)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZUVIX_STATE_DIR="${ZUVIX_STATE_DIR:-$HOME/.zuvix}"
ZUVIX_CONFIG="${ZUVIX_CONFIG_PATH:-$ZUVIX_STATE_DIR/zuvix.json}"
ZUVIX_DOTENV="${ZUVIX_STATE_DIR}/.env"
LOCAL_DOTENV="${SCRIPT_DIR}/.env"

echo "==> Zovyx Local Dev Setup"
echo "    State dir: $ZUVIX_STATE_DIR"
echo "    Config:    $ZUVIX_CONFIG"
echo ""

# ---------------------------------------------------------------------------
# 1. Ensure local .env has a generated gateway token
# ---------------------------------------------------------------------------
if ! grep -q '^ZUVIX_GATEWAY_TOKEN=[^# ]' "$LOCAL_DOTENV" 2>/dev/null; then
  TOKEN=$(openssl rand -hex 32)
  if grep -q '^ZUVIX_GATEWAY_TOKEN=' "$LOCAL_DOTENV" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s/^ZUVIX_GATEWAY_TOKEN=.*/ZUVIX_GATEWAY_TOKEN=$TOKEN/" "$LOCAL_DOTENV"
    else
      sed -i "s/^ZUVIX_GATEWAY_TOKEN=.*/ZUVIX_GATEWAY_TOKEN=$TOKEN/" "$LOCAL_DOTENV"
    fi
  else
    echo "ZUVIX_GATEWAY_TOKEN=$TOKEN" >> "$LOCAL_DOTENV"
  fi
  echo "  [setup] Generated ZUVIX_GATEWAY_TOKEN in $LOCAL_DOTENV"
else
  echo "  [ok]   ZUVIX_GATEWAY_TOKEN already set in $LOCAL_DOTENV"
fi

# ---------------------------------------------------------------------------
# 2. Patch or create zuvix.json with local dev bypass flags
# ---------------------------------------------------------------------------
mkdir -p "$ZUVIX_STATE_DIR"

if [ -f "$ZUVIX_CONFIG" ]; then
  # Patch existing config with jq, fallback to python if jq not available
  if command -v jq &>/dev/null; then
    TMP=$(mktemp)
    jq '.gateway.controlUi.allowInsecureAuth = true | .gateway.controlUi.dangerouslyDisableDeviceAuth = true' \
      "$ZUVIX_CONFIG" > "$TMP" && mv "$TMP" "$ZUVIX_CONFIG"
    echo "  [patched] $ZUVIX_CONFIG (allowInsecureAuth + dangerouslyDisableDeviceAuth)"
  elif command -v python3 &>/dev/null; then
    python3 -c "
import json
with open('$ZUVIX_CONFIG') as f: cfg = json.load(f)
cfg.setdefault('gateway', {}).setdefault('controlUi', {})
cfg['gateway']['controlUi']['allowInsecureAuth'] = True
cfg['gateway']['controlUi']['dangerouslyDisableDeviceAuth'] = True
with open('$ZUVIX_CONFIG', 'w') as f: json.dump(cfg, f, indent=2)
print('Patched config')
"
    echo "  [patched] $ZUVIX_CONFIG (allowInsecureAuth + dangerouslyDisableDeviceAuth)"
  else
    echo "  [warn]  Install jq or python3 to auto-patch gateway config."
    echo "          Manual: add these to $ZUVIX_CONFIG under gateway.controlUi:"
    echo '            "allowInsecureAuth": true'
    echo '            "dangerouslyDisableDeviceAuth": true'
  fi
else
  cat > "$ZUVIX_CONFIG" << 'JSON'
{
  "gateway": {
    "controlUi": {
      "allowInsecureAuth": true,
      "dangerouslyDisableDeviceAuth": true
    }
  }
}
JSON
  echo "  [created] $ZUVIX_CONFIG with dev bypass flags"
fi

# ---------------------------------------------------------------------------
# 3. Set up Appwrite/Supabase env vars for the UI (if missing)
# ----------------------------------------------------------------------------
if ! grep -q '^VITE_APPWRITE_ENDPOINT=' "$LOCAL_DOTENV" 2>/dev/null; then
  echo 'VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1' >> "$LOCAL_DOTENV"
  echo 'VITE_APPWRITE_PROJECT_ID=replace-with-your-project-id' >> "$LOCAL_DOTENV"
  echo 'VITE_SUPABASE_URL=https://your-project.supabase.co' >> "$LOCAL_DOTENV"
  echo 'VITE_SUPABASE_ANON_KEY=your-anon-key' >> "$LOCAL_DOTENV"
  echo "  [setup] Added Appwrite/Supabase VITE_* placeholders to $LOCAL_DOTENV"
  echo "  [!!!]   Edit $LOCAL_DOTENV with your real project IDs"
fi

# ---------------------------------------------------------------------------
# 4. Done
# ---------------------------------------------------------------------------
echo ""
echo "==> Setup complete."
echo "    Start the gateway:  cd $SCRIPT_DIR && pnpm gateway:dev"
echo "    Start the UI:       cd $SCRIPT_DIR/ui && npx vite"
echo "    Or use:             ./start.sh"

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -n "${ZUVIX_LIVE_ACP_BIND_AGENTS:-}" && "${ZUVIX_LIVE_ACP_BIND_AGENTS}" != "codex" ]]; then
  echo "ERROR: ACP spawn defaults Docker test supports only ZUVIX_LIVE_ACP_BIND_AGENTS=codex." >&2
  exit 1
fi

export ZUVIX_LIVE_ACP_BIND_AGENTS=codex
export ZUVIX_LIVE_ACP_BIND_TEST_FILES="${ZUVIX_LIVE_ACP_BIND_TEST_FILES:-src/gateway/gateway-acp-spawn-defaults.live.test.ts}"
export ZUVIX_LIVE_ACP_SPAWN_DEFAULTS=1
export ZUVIX_LIVE_ACP_SPAWN_DEFAULTS_MODEL="${ZUVIX_LIVE_ACP_SPAWN_DEFAULTS_MODEL:-openai/gpt-5.5}"
export ZUVIX_LIVE_ACP_SPAWN_DEFAULTS_THINKING="${ZUVIX_LIVE_ACP_SPAWN_DEFAULTS_THINKING:-high}"
export ZUVIX_LIVE_ACP_BIND_CODEX_MODEL="${ZUVIX_LIVE_ACP_BIND_CODEX_MODEL:-gpt-5.5}"

exec bash "$SCRIPT_DIR/test-live-acp-bind-docker.sh"

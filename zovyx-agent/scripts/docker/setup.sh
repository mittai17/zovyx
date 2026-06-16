#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-build.sh"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
EXTRA_COMPOSE_FILE="$ROOT_DIR/docker-compose.extra.yml"
IMAGE_NAME="${ZUVIX_IMAGE:-zuvix:local}"
EXTRA_MOUNTS="${ZUVIX_EXTRA_MOUNTS:-}"
HOME_VOLUME_NAME="${ZUVIX_HOME_VOLUME:-}"
RAW_SANDBOX_SETTING="${ZUVIX_SANDBOX:-}"
SANDBOX_ENABLED=""
DOCKER_SOCKET_PATH="${ZUVIX_DOCKER_SOCKET:-}"
TIMEZONE="${ZUVIX_TZ:-}"
RAW_SKIP_ONBOARDING="${ZUVIX_SKIP_ONBOARDING:-}"
SKIP_ONBOARDING=""
DOCKER_PULL_TIMEOUT="${ZUVIX_DOCKER_SETUP_PULL_TIMEOUT:-600s}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing dependency: $1" >&2
    exit 1
  fi
}

run_docker_build() {
  # Dockerfile uses BuildKit-only syntax (RUN --mount=type=cache). Force
  # BuildKit so hosts defaulting to the legacy builder do not fail.
  docker_build_exec "$@"
}

run_docker_pull() {
  local image="$1"
  if command -v timeout >/dev/null 2>&1; then
    if timeout --kill-after=1s 1s true >/dev/null 2>&1; then
      timeout --kill-after=30s "$DOCKER_PULL_TIMEOUT" docker pull "$image"
    else
      timeout "$DOCKER_PULL_TIMEOUT" docker pull "$image"
    fi
    return
  fi
  docker pull "$image"
}

is_truthy_value() {
  local raw="${1:-}"
  raw="$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]')"
  case "$raw" in
    1 | true | yes | on) return 0 ;;
    *) return 1 ;;
  esac
}

read_config_gateway_token() {
  local config_path="$ZUVIX_CONFIG_DIR/zuvix.json"
  if [[ ! -f "$config_path" ]]; then
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$config_path" <<'PY'
import json
import sys

path = sys.argv[1]
try:
    with open(path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
except Exception:
    raise SystemExit(0)

gateway = cfg.get("gateway")
if not isinstance(gateway, dict):
    raise SystemExit(0)
auth = gateway.get("auth")
if not isinstance(auth, dict):
    raise SystemExit(0)
token = auth.get("token")
if isinstance(token, str):
    token = token.strip()
    if token:
        print(token)
PY
    return 0
  fi
  if command -v node >/dev/null 2>&1; then
    node - "$config_path" <<'NODE'
const fs = require("node:fs");
const configPath = process.argv[2];
try {
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const token = cfg?.gateway?.auth?.token;
  if (typeof token === "string" && token.trim().length > 0) {
    process.stdout.write(token.trim());
  }
} catch {
  // Keep docker-setup resilient when config parsing fails.
}
NODE
  fi
}

read_env_gateway_token() {
  local env_path="$1"
  local line=""
  local token=""
  if [[ ! -f "$env_path" ]]; then
    return 0
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    if [[ "$line" == ZUVIX_GATEWAY_TOKEN=* ]]; then
      token="${line#ZUVIX_GATEWAY_TOKEN=}"
    fi
  done <"$env_path"
  if [[ -n "$token" ]]; then
    printf '%s' "$token"
  fi
}

sync_gateway_config() {
  local allowed_origin_json=""
  local current_allowed_origins=""
  local batch_json=""

  if [[ "${ZUVIX_GATEWAY_BIND}" != "loopback" ]]; then
    allowed_origin_json="$(printf '["http://localhost:%s","http://127.0.0.1:%s"]' "$ZUVIX_GATEWAY_PORT" "$ZUVIX_GATEWAY_PORT")"
    current_allowed_origins="$(
      run_prestart_cli config get gateway.controlUi.allowedOrigins 2>/dev/null || true
    )"
    current_allowed_origins="${current_allowed_origins//$'\r'/}"
  fi

  batch_json="$(printf '[{"path":"gateway.mode","value":"local"},{"path":"gateway.bind","value":"%s"}' "$ZUVIX_GATEWAY_BIND")"
  if [[ -n "$allowed_origin_json" ]]; then
    if [[ -n "$current_allowed_origins" && "$current_allowed_origins" != "null" && "$current_allowed_origins" != "[]" ]]; then
      echo "Control UI allowlist already configured; leaving gateway.controlUi.allowedOrigins unchanged."
    else
      batch_json+=",{\"path\":\"gateway.controlUi.allowedOrigins\",\"value\":$allowed_origin_json}"
    fi
  fi
  batch_json+="]"

  run_prestart_cli config set --batch-json "$batch_json" >/dev/null
  echo "Pinned gateway.mode=local and gateway.bind=$ZUVIX_GATEWAY_BIND for Docker setup."
  if [[ -n "$allowed_origin_json" ]]; then
    if [[ -z "$current_allowed_origins" || "$current_allowed_origins" == "null" || "$current_allowed_origins" == "[]" ]]; then
      echo "Set gateway.controlUi.allowedOrigins to $allowed_origin_json for non-loopback bind."
    fi
  fi
}

run_prestart_gateway() {
  docker compose "${COMPOSE_ARGS[@]}" run --rm --no-deps "$@"
}

run_prestart_cli() {
  # During setup, avoid the shared-network zuvix-cli service because it
  # requires the gateway container's network namespace to already exist. That
  # creates a circular dependency for config writes that are needed before the
  # gateway can start cleanly.
  # Host ZUVIX_* paths are Compose bind-mount sources. Setup-time CLI writes
  # must still resolve state/config paths inside the container.
  run_prestart_gateway \
    -e HOME=/home/node \
    -e ZUVIX_HOME=/home/node \
    -e ZUVIX_STATE_DIR=/home/node/.zuvix \
    -e ZUVIX_CONFIG_PATH=/home/node/.zuvix/zuvix.json \
    -e ZUVIX_CONFIG_DIR=/home/node/.zuvix \
    -e ZUVIX_WORKSPACE_DIR=/home/node/.zuvix/workspace \
    --entrypoint node zuvix-gateway \
    dist/index.js "$@"
}

run_runtime_cli() {
  local compose_scope="${1:-current}"
  local deps_mode="${2:-with-deps}"
  shift 2

  local -a compose_args
  local -a run_args=(run --rm)

  case "$compose_scope" in
    current) compose_args=("${COMPOSE_ARGS[@]}") ;;
    base) compose_args=("${BASE_COMPOSE_ARGS[@]}") ;;
    *) fail "Unknown runtime CLI compose scope: $compose_scope" ;;
  esac

  case "$deps_mode" in
    with-deps) ;;
    no-deps) run_args+=(--no-deps) ;;
    *) fail "Unknown runtime CLI deps mode: $deps_mode" ;;
  esac

  docker compose "${compose_args[@]}" "${run_args[@]}" zuvix-cli "$@"
}

contains_disallowed_chars() {
  local value="$1"
  [[ "$value" == *$'\n'* || "$value" == *$'\r'* || "$value" == *$'\t'* ]]
}

is_valid_timezone() {
  local value="$1"
  [[ -e "/usr/share/zoneinfo/$value" && ! -d "/usr/share/zoneinfo/$value" ]]
}

validate_mount_path_value() {
  local label="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    fail "$label cannot be empty."
  fi
  if contains_disallowed_chars "$value"; then
    fail "$label contains unsupported control characters."
  fi
}

validate_named_volume() {
  local value="$1"
  if [[ ! "$value" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]*$ ]]; then
    fail "ZUVIX_HOME_VOLUME must match [A-Za-z0-9][A-Za-z0-9_.-]* when using a named volume."
  fi
}

validate_mount_spec() {
  local mount="$1"
  if contains_disallowed_chars "$mount"; then
    fail "ZUVIX_EXTRA_MOUNTS entries cannot contain control characters."
  fi
  # Keep mount specs strict to avoid YAML structure injection.
  # Expected format: source:target[:options]
  if [[ ! "$mount" =~ ^[^,:]+:[^,:]+(:[^,:]+)?$ ]]; then
    fail "Invalid mount format '$mount'. Expected source:target[:options] without commas or control characters."
  fi
}

quote_yaml_string() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

require_cmd docker
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose not available (try: docker compose version)" >&2
  exit 1
fi

if [[ -z "$DOCKER_SOCKET_PATH" && "${DOCKER_HOST:-}" == unix://* ]]; then
  DOCKER_SOCKET_PATH="${DOCKER_HOST#unix://}"
fi
if [[ -z "$DOCKER_SOCKET_PATH" ]]; then
  DOCKER_SOCKET_PATH="/var/run/docker.sock"
fi
if is_truthy_value "$RAW_SANDBOX_SETTING"; then
  SANDBOX_ENABLED="1"
fi
if is_truthy_value "$RAW_SKIP_ONBOARDING"; then
  SKIP_ONBOARDING="1"
fi

ZUVIX_CONFIG_DIR="${ZUVIX_CONFIG_DIR:-$HOME/.zuvix}"
ZUVIX_WORKSPACE_DIR="${ZUVIX_WORKSPACE_DIR:-$HOME/.zuvix/workspace}"
ZUVIX_AUTH_PROFILE_SECRET_DIR="${ZUVIX_AUTH_PROFILE_SECRET_DIR:-$HOME/.zuvix-auth-profile-secrets}"

validate_mount_path_value "ZUVIX_CONFIG_DIR" "$ZUVIX_CONFIG_DIR"
validate_mount_path_value "ZUVIX_WORKSPACE_DIR" "$ZUVIX_WORKSPACE_DIR"
validate_mount_path_value "ZUVIX_AUTH_PROFILE_SECRET_DIR" "$ZUVIX_AUTH_PROFILE_SECRET_DIR"
if [[ -n "$HOME_VOLUME_NAME" ]]; then
  if [[ "$HOME_VOLUME_NAME" == *"/"* ]]; then
    validate_mount_path_value "ZUVIX_HOME_VOLUME" "$HOME_VOLUME_NAME"
  else
    validate_named_volume "$HOME_VOLUME_NAME"
  fi
fi
if contains_disallowed_chars "$EXTRA_MOUNTS"; then
  fail "ZUVIX_EXTRA_MOUNTS cannot contain control characters."
fi
if [[ -n "$SANDBOX_ENABLED" ]]; then
  validate_mount_path_value "ZUVIX_DOCKER_SOCKET" "$DOCKER_SOCKET_PATH"
fi
if [[ -n "$TIMEZONE" ]]; then
  if contains_disallowed_chars "$TIMEZONE"; then
    fail "ZUVIX_TZ contains unsupported control characters."
  fi
  if [[ ! "$TIMEZONE" =~ ^[A-Za-z0-9/_+\-]+$ ]]; then
    fail "ZUVIX_TZ must be a valid IANA timezone string (e.g. Asia/Shanghai)."
  fi
  if ! is_valid_timezone "$TIMEZONE"; then
    fail "ZUVIX_TZ must match a timezone in /usr/share/zoneinfo (e.g. Asia/Shanghai)."
  fi
fi

mkdir -p "$ZUVIX_CONFIG_DIR"
mkdir -p "$ZUVIX_WORKSPACE_DIR"
mkdir -p "$ZUVIX_AUTH_PROFILE_SECRET_DIR"
# Seed directory tree eagerly so bind mounts work even on Docker Desktop/Windows
# where the container (even as root) cannot create new host subdirectories.
mkdir -p "$ZUVIX_CONFIG_DIR/identity"
mkdir -p "$ZUVIX_CONFIG_DIR/agents/main/agent"
mkdir -p "$ZUVIX_CONFIG_DIR/agents/main/sessions"

export ZUVIX_CONFIG_DIR
export ZUVIX_WORKSPACE_DIR
export ZUVIX_AUTH_PROFILE_SECRET_DIR
export ZUVIX_GATEWAY_PORT="${ZUVIX_GATEWAY_PORT:-18789}"
export ZUVIX_BRIDGE_PORT="${ZUVIX_BRIDGE_PORT:-18790}"
export ZUVIX_GATEWAY_BIND="${ZUVIX_GATEWAY_BIND:-lan}"
export ZUVIX_DISABLE_BONJOUR="${ZUVIX_DISABLE_BONJOUR:-}"
export ZUVIX_IMAGE="$IMAGE_NAME"
export ZUVIX_IMAGE_APT_PACKAGES="${ZUVIX_IMAGE_APT_PACKAGES-${ZUVIX_DOCKER_APT_PACKAGES:-}}"
export ZUVIX_IMAGE_PIP_PACKAGES="${ZUVIX_IMAGE_PIP_PACKAGES:-}"
export ZUVIX_EXTENSIONS="${ZUVIX_EXTENSIONS:-}"
export ZUVIX_INSTALL_BROWSER="${ZUVIX_INSTALL_BROWSER:-}"
export ZUVIX_EXTRA_MOUNTS="$EXTRA_MOUNTS"
export ZUVIX_HOME_VOLUME="$HOME_VOLUME_NAME"
export ZUVIX_ALLOW_INSECURE_PRIVATE_WS="${ZUVIX_ALLOW_INSECURE_PRIVATE_WS:-}"
export ZUVIX_SANDBOX="$SANDBOX_ENABLED"
export ZUVIX_DOCKER_SOCKET="$DOCKER_SOCKET_PATH"
export ZUVIX_DOCKER_SETUP=1
export ZUVIX_TZ="$TIMEZONE"
export OTEL_EXPORTER_OTLP_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-}"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-}"
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT="${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-}"
export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-}"
export OTEL_EXPORTER_OTLP_PROTOCOL="${OTEL_EXPORTER_OTLP_PROTOCOL:-}"
export OTEL_SERVICE_NAME="${OTEL_SERVICE_NAME:-}"
export OTEL_SEMCONV_STABILITY_OPT_IN="${OTEL_SEMCONV_STABILITY_OPT_IN:-}"
export ZUVIX_OTEL_PRELOADED="${ZUVIX_OTEL_PRELOADED:-}"
export ZUVIX_SKIP_ONBOARDING="$SKIP_ONBOARDING"

# Detect Docker socket GID for sandbox group_add.
DOCKER_GID=""
if [[ -n "$SANDBOX_ENABLED" && -S "$DOCKER_SOCKET_PATH" ]]; then
  DOCKER_GID="$(stat -c '%g' "$DOCKER_SOCKET_PATH" 2>/dev/null || stat -f '%g' "$DOCKER_SOCKET_PATH" 2>/dev/null || echo "")"
fi
export DOCKER_GID

if [[ -z "${ZUVIX_GATEWAY_TOKEN:-}" ]]; then
  EXISTING_CONFIG_TOKEN="$(read_config_gateway_token || true)"
  if [[ -n "$EXISTING_CONFIG_TOKEN" ]]; then
    ZUVIX_GATEWAY_TOKEN="$EXISTING_CONFIG_TOKEN"
    echo "Reusing gateway token from $ZUVIX_CONFIG_DIR/zuvix.json"
  else
    DOTENV_GATEWAY_TOKEN="$(read_env_gateway_token "$ROOT_DIR/.env" || true)"
    if [[ -n "$DOTENV_GATEWAY_TOKEN" ]]; then
      ZUVIX_GATEWAY_TOKEN="$DOTENV_GATEWAY_TOKEN"
      echo "Reusing gateway token from $ROOT_DIR/.env"
    elif command -v openssl >/dev/null 2>&1; then
      ZUVIX_GATEWAY_TOKEN="$(openssl rand -hex 32)"
    else
      ZUVIX_GATEWAY_TOKEN="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
)"
    fi
  fi
fi
export ZUVIX_GATEWAY_TOKEN

COMPOSE_FILES=("$COMPOSE_FILE")
COMPOSE_ARGS=()

write_extra_compose() {
  local home_volume="$1"
  shift
  local mount
  local gateway_home_mount
  local gateway_config_mount
  local gateway_workspace_mount
  local gateway_auth_profile_secret_mount

  cat >"$EXTRA_COMPOSE_FILE" <<'YAML'
services:
  zuvix-gateway:
    volumes:
YAML

  if [[ -n "$home_volume" ]]; then
    gateway_home_mount="${home_volume}:/home/node"
    gateway_config_mount="${ZUVIX_CONFIG_DIR}:/home/node/.zuvix"
    gateway_workspace_mount="${ZUVIX_WORKSPACE_DIR}:/home/node/.zuvix/workspace"
    gateway_auth_profile_secret_mount="${ZUVIX_AUTH_PROFILE_SECRET_DIR}:/home/node/.config/zuvix"
    validate_mount_spec "$gateway_home_mount"
    validate_mount_spec "$gateway_config_mount"
    validate_mount_spec "$gateway_workspace_mount"
    validate_mount_spec "$gateway_auth_profile_secret_mount"
    printf '      - %s\n' "$(quote_yaml_string "$gateway_home_mount")" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s\n' "$(quote_yaml_string "$gateway_config_mount")" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s\n' "$(quote_yaml_string "$gateway_workspace_mount")" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s\n' "$(quote_yaml_string "$gateway_auth_profile_secret_mount")" >>"$EXTRA_COMPOSE_FILE"
  fi

  for mount in "$@"; do
    validate_mount_spec "$mount"
    printf '      - %s\n' "$(quote_yaml_string "$mount")" >>"$EXTRA_COMPOSE_FILE"
  done

  cat >>"$EXTRA_COMPOSE_FILE" <<'YAML'
  zuvix-cli:
    volumes:
YAML

  if [[ -n "$home_volume" ]]; then
    printf '      - %s\n' "$(quote_yaml_string "$gateway_home_mount")" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s\n' "$(quote_yaml_string "$gateway_config_mount")" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s\n' "$(quote_yaml_string "$gateway_workspace_mount")" >>"$EXTRA_COMPOSE_FILE"
    printf '      - %s\n' "$(quote_yaml_string "$gateway_auth_profile_secret_mount")" >>"$EXTRA_COMPOSE_FILE"
  fi

  for mount in "$@"; do
    validate_mount_spec "$mount"
    printf '      - %s\n' "$(quote_yaml_string "$mount")" >>"$EXTRA_COMPOSE_FILE"
  done

  if [[ -n "$home_volume" && "$home_volume" != *"/"* ]]; then
    validate_named_volume "$home_volume"
    cat >>"$EXTRA_COMPOSE_FILE" <<YAML
volumes:
  ${home_volume}:
YAML
  fi
}

# When sandbox is requested, ensure Docker CLI build arg is set for local builds.
# Docker socket mount is deferred until sandbox prerequisites are verified.
if [[ -n "$SANDBOX_ENABLED" ]]; then
  if [[ -z "${ZUVIX_INSTALL_DOCKER_CLI:-}" ]]; then
    export ZUVIX_INSTALL_DOCKER_CLI=1
  fi
fi

VALID_MOUNTS=()
if [[ -n "$EXTRA_MOUNTS" ]]; then
  IFS=',' read -r -a mounts <<<"$EXTRA_MOUNTS"
  for mount in "${mounts[@]}"; do
    mount="${mount#"${mount%%[![:space:]]*}"}"
    mount="${mount%"${mount##*[![:space:]]}"}"
    if [[ -n "$mount" ]]; then
      VALID_MOUNTS+=("$mount")
    fi
  done
fi

if [[ -n "$HOME_VOLUME_NAME" || ${#VALID_MOUNTS[@]} -gt 0 ]]; then
  # Bash 3.2 + nounset treats "${array[@]}" on an empty array as unbound.
  if [[ ${#VALID_MOUNTS[@]} -gt 0 ]]; then
    write_extra_compose "$HOME_VOLUME_NAME" "${VALID_MOUNTS[@]}"
  else
    write_extra_compose "$HOME_VOLUME_NAME"
  fi
  COMPOSE_FILES+=("$EXTRA_COMPOSE_FILE")
fi
for compose_file in "${COMPOSE_FILES[@]}"; do
  COMPOSE_ARGS+=("-f" "$compose_file")
done
# Keep a base compose arg set without sandbox overlay so rollback paths can
# force a known-safe gateway service definition (no docker.sock mount).
BASE_COMPOSE_ARGS=("${COMPOSE_ARGS[@]}")
COMPOSE_HINT="docker compose"
for compose_file in "${COMPOSE_FILES[@]}"; do
  COMPOSE_HINT+=" -f ${compose_file}"
done

ENV_FILE="$ROOT_DIR/.env"
upsert_env() {
  local file="$1"
  shift
  local -a keys=("$@")
  local tmp
  tmp="$(mktemp)"
  # Use a delimited string instead of an associative array so the script
  # works with Bash 3.2 (macOS default) which lacks `declare -A`.
  local seen=" "

  if [[ -f "$file" ]]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      local key="${line%%=*}"
      local replaced=false
      for k in "${keys[@]}"; do
        if [[ "$key" == "$k" ]]; then
          printf '%s=%s\n' "$k" "${!k-}" >>"$tmp"
          seen="$seen$k "
          replaced=true
          break
        fi
      done
      if [[ "$replaced" == false ]]; then
        printf '%s\n' "$line" >>"$tmp"
      fi
    done <"$file"
  fi

  for k in "${keys[@]}"; do
    if [[ "$seen" != *" $k "* ]]; then
      printf '%s=%s\n' "$k" "${!k-}" >>"$tmp"
    fi
  done

  mv "$tmp" "$file"
}

upsert_env "$ENV_FILE" \
  ZUVIX_CONFIG_DIR \
  ZUVIX_WORKSPACE_DIR \
  ZUVIX_AUTH_PROFILE_SECRET_DIR \
  ZUVIX_GATEWAY_PORT \
  ZUVIX_BRIDGE_PORT \
  ZUVIX_GATEWAY_BIND \
  ZUVIX_DISABLE_BONJOUR \
  ZUVIX_GATEWAY_TOKEN \
  ZUVIX_IMAGE \
  ZUVIX_EXTRA_MOUNTS \
  ZUVIX_HOME_VOLUME \
  ZUVIX_IMAGE_APT_PACKAGES \
  ZUVIX_IMAGE_PIP_PACKAGES \
  ZUVIX_EXTENSIONS \
  ZUVIX_INSTALL_BROWSER \
  ZUVIX_SANDBOX \
  ZUVIX_DOCKER_SOCKET \
  DOCKER_GID \
  ZUVIX_INSTALL_DOCKER_CLI \
  ZUVIX_ALLOW_INSECURE_PRIVATE_WS \
  ZUVIX_TZ \
  OTEL_EXPORTER_OTLP_ENDPOINT \
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT \
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT \
  OTEL_EXPORTER_OTLP_LOGS_ENDPOINT \
  OTEL_EXPORTER_OTLP_PROTOCOL \
  OTEL_SERVICE_NAME \
  OTEL_SEMCONV_STABILITY_OPT_IN \
  ZUVIX_OTEL_PRELOADED \
  ZUVIX_SKIP_ONBOARDING

if [[ "$IMAGE_NAME" == "zuvix:local" ]]; then
  echo "==> Building Docker image: $IMAGE_NAME"
  run_docker_build \
    --build-arg "ZUVIX_IMAGE_APT_PACKAGES=${ZUVIX_IMAGE_APT_PACKAGES}" \
    --build-arg "ZUVIX_IMAGE_PIP_PACKAGES=${ZUVIX_IMAGE_PIP_PACKAGES}" \
    --build-arg "ZUVIX_EXTENSIONS=${ZUVIX_EXTENSIONS}" \
    --build-arg "ZUVIX_INSTALL_BROWSER=${ZUVIX_INSTALL_BROWSER}" \
    --build-arg "ZUVIX_INSTALL_DOCKER_CLI=${ZUVIX_INSTALL_DOCKER_CLI:-}" \
    -t "$IMAGE_NAME" \
    -f "$ROOT_DIR/Dockerfile" \
    "$ROOT_DIR"
else
  echo "==> Pulling Docker image: $IMAGE_NAME"
  if ! run_docker_pull "$IMAGE_NAME"; then
    echo "ERROR: Failed to pull image $IMAGE_NAME. Please check the image name and your access permissions." >&2
    exit 1
  fi
fi

# Ensure bind-mounted data directories are writable by the container's `node`
# user (uid 1000). Host-created dirs inherit the host user's uid which may
# differ, causing EACCES when the container tries to mkdir/write.
# Running a brief root container to chown is the portable Docker idiom --
# it works regardless of the host uid and doesn't require host-side root.
echo ""
echo "==> Fixing data-directory permissions"
# Use -xdev to restrict chown to the config-dir mount only — without it,
# the recursive chown would cross into the workspace bind mount and rewrite
# ownership of all user project files on Linux hosts.
# After fixing the config dir, only the Zuvix metadata subdirectory
# (.zuvix/) inside the workspace gets chowned, not the user's project files.
run_prestart_gateway --user root --entrypoint sh zuvix-gateway -c \
  'find /home/node/.zuvix -xdev -exec chown node:node {} +; \
   chown node:node /home/node/.config; \
   find /home/node/.config/zuvix -xdev -exec chown node:node {} +; \
   [ -d /home/node/.zuvix/workspace/.zuvix ] && chown -R node:node /home/node/.zuvix/workspace/.zuvix || true'

echo ""
if [[ -n "$SKIP_ONBOARDING" ]]; then
  echo "==> Skipping onboarding (ZUVIX_SKIP_ONBOARDING is set)"
else
  echo "==> Onboarding (interactive)"
  echo "Docker setup pins Gateway mode to local."
  echo "Gateway runtime bind comes from ZUVIX_GATEWAY_BIND (default: lan)."
  echo "Current runtime bind: $ZUVIX_GATEWAY_BIND"
  if is_truthy_value "$ZUVIX_DISABLE_BONJOUR"; then
    echo "Bonjour/mDNS advertising: force disabled (ZUVIX_DISABLE_BONJOUR=$ZUVIX_DISABLE_BONJOUR)."
  elif [[ -z "$ZUVIX_DISABLE_BONJOUR" ]]; then
    echo "Bonjour/mDNS advertising: auto (disabled inside the Gateway container unless explicitly enabled)."
  else
    echo "Bonjour/mDNS advertising: explicitly enabled (ZUVIX_DISABLE_BONJOUR=$ZUVIX_DISABLE_BONJOUR)."
  fi
  echo "Gateway token: stored in Docker environment/config (not printed)."
  echo "Tailscale exposure: Off (use host-level tailnet/Tailscale setup separately)."
  echo "Install Gateway daemon: No (managed by Docker Compose)"
  echo ""
  run_prestart_cli onboard \
    --mode local \
    --no-install-daemon \
    --gateway-auth token \
    --gateway-token-ref-env ZUVIX_GATEWAY_TOKEN \
    --skip-ui \
    --suppress-gateway-token-output
fi

echo ""
echo "==> Docker gateway defaults"
sync_gateway_config

echo ""
echo "==> Provider setup (optional)"
echo "WhatsApp (QR):"
echo "  ${COMPOSE_HINT} run --rm zuvix-cli channels login"
echo "Telegram (bot token):"
echo "  ${COMPOSE_HINT} run --rm zuvix-cli channels add --channel telegram --token <token>"
echo "Discord (bot token):"
echo "  ${COMPOSE_HINT} run --rm zuvix-cli channels add --channel discord --token <token>"
echo "Docs: https://docs.zuvix.ai/channels"

echo ""
echo "==> Starting gateway"
docker compose "${COMPOSE_ARGS[@]}" up -d zuvix-gateway

# --- Sandbox setup (opt-in via ZUVIX_SANDBOX=1) ---
if [[ -n "$SANDBOX_ENABLED" ]]; then
  echo ""
  echo "==> Sandbox setup"

  sandbox_dockerfile="$ROOT_DIR/scripts/docker/sandbox/Dockerfile"
  if [[ -f "$sandbox_dockerfile" ]]; then
    echo "Building sandbox image: zuvix-sandbox:bookworm-slim"
    run_docker_build \
      -t "zuvix-sandbox:bookworm-slim" \
      -f "$sandbox_dockerfile" \
      "$ROOT_DIR"
  else
    echo "WARNING: sandbox Dockerfile not found at $sandbox_dockerfile" >&2
    echo "  Sandbox config will be applied but no sandbox image will be built." >&2
    echo "  Agent exec may fail if the configured sandbox image does not exist." >&2
  fi

  # Defense-in-depth: verify Docker CLI in the running image before enabling
  # sandbox. This avoids claiming sandbox is enabled when the image cannot
  # launch sandbox containers.
  if ! docker compose "${COMPOSE_ARGS[@]}" run --rm --entrypoint docker zuvix-gateway --version >/dev/null 2>&1; then
    echo "WARNING: Docker CLI not found inside the container image." >&2
    echo "  Sandbox requires Docker CLI. Rebuild with --build-arg ZUVIX_INSTALL_DOCKER_CLI=1" >&2
    echo "  or use a local build (ZUVIX_IMAGE=zuvix:local). Skipping sandbox setup." >&2
    SANDBOX_ENABLED=""
  fi
fi

# Apply sandbox config only if prerequisites are met.
if [[ -n "$SANDBOX_ENABLED" ]]; then
  # Mount Docker socket via a dedicated compose overlay. This overlay is
  # created only after sandbox prerequisites pass, so the socket is never
  # exposed when sandbox cannot actually run.
  if [[ -S "$DOCKER_SOCKET_PATH" ]]; then
    SANDBOX_COMPOSE_FILE="$ROOT_DIR/docker-compose.sandbox.yml"
    cat >"$SANDBOX_COMPOSE_FILE" <<YAML
services:
  zuvix-gateway:
    volumes:
      - $(quote_yaml_string "${DOCKER_SOCKET_PATH}:/var/run/docker.sock")
YAML
    if [[ -n "${DOCKER_GID:-}" ]]; then
      cat >>"$SANDBOX_COMPOSE_FILE" <<YAML
    group_add:
      - "${DOCKER_GID}"
YAML
    fi
    COMPOSE_ARGS+=("-f" "$SANDBOX_COMPOSE_FILE")
    echo "==> Sandbox: added Docker socket mount"
  else
    echo "WARNING: ZUVIX_SANDBOX enabled but Docker socket not found at $DOCKER_SOCKET_PATH." >&2
    echo "  Sandbox requires Docker socket access. Skipping sandbox setup." >&2
    SANDBOX_ENABLED=""
  fi
fi

if [[ -n "$SANDBOX_ENABLED" ]]; then
  # Enable sandbox in Zuvix config.
  sandbox_config_ok=true
  if ! run_runtime_cli current no-deps \
    config set agents.defaults.sandbox.mode "non-main" >/dev/null; then
    echo "WARNING: Failed to set agents.defaults.sandbox.mode" >&2
    sandbox_config_ok=false
  fi
  if ! run_runtime_cli current no-deps \
    config set agents.defaults.sandbox.scope "agent" >/dev/null; then
    echo "WARNING: Failed to set agents.defaults.sandbox.scope" >&2
    sandbox_config_ok=false
  fi
  if ! run_runtime_cli current no-deps \
    config set agents.defaults.sandbox.workspaceAccess "none" >/dev/null; then
    echo "WARNING: Failed to set agents.defaults.sandbox.workspaceAccess" >&2
    sandbox_config_ok=false
  fi

  if [[ "$sandbox_config_ok" == true ]]; then
    echo "Sandbox enabled: mode=non-main, scope=agent, workspaceAccess=none"
    echo "Docs: https://docs.zuvix.ai/gateway/sandboxing"
    # Restart gateway with sandbox compose overlay to pick up socket mount + config.
    docker compose "${COMPOSE_ARGS[@]}" up -d zuvix-gateway
  else
    echo "WARNING: Sandbox config was partially applied. Check errors above." >&2
    echo "  Skipping gateway restart to avoid exposing Docker socket without a full sandbox policy." >&2
    if ! run_runtime_cli base no-deps \
      config set agents.defaults.sandbox.mode "off" >/dev/null; then
      echo "WARNING: Failed to roll back agents.defaults.sandbox.mode to off" >&2
    else
      echo "Sandbox mode rolled back to off due to partial sandbox config failure."
    fi
    if [[ -n "${SANDBOX_COMPOSE_FILE:-}" ]]; then
      rm -f "$SANDBOX_COMPOSE_FILE"
    fi
    # Ensure gateway service definition is reset without sandbox overlay mount.
    docker compose "${BASE_COMPOSE_ARGS[@]}" up -d --force-recreate zuvix-gateway
  fi
else
  # Keep reruns deterministic: if sandbox is not active for this run, reset
  # persisted sandbox mode so future execs do not require docker.sock by stale
  # config alone.
  if ! run_runtime_cli current with-deps \
    config set agents.defaults.sandbox.mode "off" >/dev/null; then
    echo "WARNING: Failed to reset agents.defaults.sandbox.mode to off" >&2
  fi
  if [[ -f "$ROOT_DIR/docker-compose.sandbox.yml" ]]; then
    rm -f "$ROOT_DIR/docker-compose.sandbox.yml"
  fi
fi

echo ""
echo "Gateway running with host port mapping."
echo "Access from tailnet devices via the host's tailnet IP."
echo "Config: $ZUVIX_CONFIG_DIR"
echo "Workspace: $ZUVIX_WORKSPACE_DIR"
echo "Token: stored in Docker environment/config (not printed)."
echo ""
echo "Commands:"
echo "  ${COMPOSE_HINT} logs -f zuvix-gateway"
echo "  ${COMPOSE_HINT} exec zuvix-gateway sh -lc 'node dist/index.js health --token \"\$ZUVIX_GATEWAY_TOKEN\"'"

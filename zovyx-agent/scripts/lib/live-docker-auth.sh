#!/usr/bin/env bash

ZUVIX_DOCKER_LIVE_AUTH_ALL=(.factory .gemini .minimax)
ZUVIX_DOCKER_LIVE_AUTH_FILES_ALL=(
  .codex/auth.json
  .codex/config.toml
  .claude.json
  .claude/.credentials.json
  .claude/settings.json
  .claude/settings.local.json
  .gemini/settings.json
)

zuvix_live_trim() {
  local value="${1:-}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

zuvix_live_truthy() {
  case "${1:-}" in
    1 | true | TRUE | yes | YES | on | ON)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

zuvix_live_is_ci() {
  zuvix_live_truthy "${CI:-}" \
    || zuvix_live_truthy "${GITHUB_ACTIONS:-}" \
    || zuvix_live_truthy "${ZUVIX_TESTBOX:-}"
}

zuvix_live_uses_managed_bind_dirs() {
  zuvix_live_is_ci \
    || [[ -n "${ZUVIX_DOCKER_CACHE_HOME_DIR:-}" ]] \
    || [[ -n "${ZUVIX_DOCKER_CLI_TOOLS_DIR:-}" ]]
}

zuvix_live_default_profile_file() {
  if [[ -n "${ZUVIX_PROFILE_FILE:-}" ]]; then
    printf '%s\n' "$ZUVIX_PROFILE_FILE"
    return 0
  fi
  local testbox_profile="$HOME/.zuvix-testbox-live.profile"
  if [[ -f "$testbox_profile" ]]; then
    printf '%s\n' "$testbox_profile"
    return 0
  fi
  printf '%s\n' "$HOME/.profile"
}

zuvix_live_validate_relative_home_path() {
  local value
  value="$(zuvix_live_trim "${1:-}")"
  [[ -n "$value" ]] || {
    echo "ERROR: empty auth path." >&2
    return 1
  }
  case "$value" in
    /* | *..* | *\\* | *:*)
      echo "ERROR: invalid auth path '$value'." >&2
      return 1
      ;;
  esac
  printf '%s' "$value"
}

zuvix_live_normalize_auth_dir() {
  local value
  value="$(zuvix_live_trim "${1:-}")"
  [[ -n "$value" ]] || return 1
  if [[ "$value" != .* ]]; then
    value=".$value"
  fi
  value="$(zuvix_live_validate_relative_home_path "$value")" || return 1
  printf '%s' "$value"
}

zuvix_live_should_include_auth_dir_for_provider() {
  local provider
  provider="$(zuvix_live_trim "${1:-}")"
  case "$provider" in
    droid | factory | factory-droid)
      printf '%s\n' ".factory"
      ;;
    gemini | gemini-cli | google-gemini-cli)
      printf '%s\n' ".gemini"
      ;;
    minimax | minimax-portal)
      printf '%s\n' ".minimax"
      ;;
  esac
}

zuvix_live_should_include_auth_file_for_provider() {
  local provider
  provider="$(zuvix_live_trim "${1:-}")"
  case "$provider" in
    codex-cli | openai)
      printf '%s\n' ".codex/auth.json"
      printf '%s\n' ".codex/config.toml"
      ;;
    anthropic | claude-cli)
      printf '%s\n' ".claude.json"
      printf '%s\n' ".claude/.credentials.json"
      printf '%s\n' ".claude/settings.json"
      printf '%s\n' ".claude/settings.local.json"
      ;;
  esac
}

zuvix_live_collect_auth_dirs_from_csv() {
  local raw="${1:-}"
  local token normalized
  [[ -n "$(zuvix_live_trim "$raw")" ]] || return 0
  IFS=',' read -r -a tokens <<<"$raw"
  for token in "${tokens[@]}"; do
    while IFS= read -r normalized; do
      printf '%s\n' "$normalized"
    done < <(zuvix_live_should_include_auth_dir_for_provider "$token")
  done | awk 'NF && !seen[$0]++'
}

zuvix_live_collect_auth_dirs_from_override() {
  local raw token normalized
  raw="$(zuvix_live_trim "${ZUVIX_DOCKER_AUTH_DIRS:-}")"
  [[ -n "$raw" ]] || return 1
  case "$raw" in
    all)
      printf '%s\n' "${ZUVIX_DOCKER_LIVE_AUTH_ALL[@]}"
      return 0
      ;;
    none)
      return 0
      ;;
  esac
  IFS=',' read -r -a tokens <<<"$raw"
  for token in "${tokens[@]}"; do
    normalized="$(zuvix_live_normalize_auth_dir "$token")" || continue
    printf '%s\n' "$normalized"
  done | awk '!seen[$0]++'
  return 0
}

zuvix_live_collect_auth_dirs() {
  if zuvix_live_collect_auth_dirs_from_override; then
    return 0
  fi
  printf '%s\n' "${ZUVIX_DOCKER_LIVE_AUTH_ALL[@]}"
}

zuvix_live_collect_auth_files_from_csv() {
  local raw="${1:-}"
  local token normalized
  [[ -n "$(zuvix_live_trim "$raw")" ]] || return 0
  IFS=',' read -r -a tokens <<<"$raw"
  for token in "${tokens[@]}"; do
    while IFS= read -r normalized; do
      printf '%s\n' "$normalized"
    done < <(zuvix_live_should_include_auth_file_for_provider "$token")
  done | awk 'NF && !seen[$0]++'
}

zuvix_live_collect_auth_files_from_override() {
  local raw
  raw="$(zuvix_live_trim "${ZUVIX_DOCKER_AUTH_DIRS:-}")"
  [[ -n "$raw" ]] || return 1
  case "$raw" in
    all)
      printf '%s\n' "${ZUVIX_DOCKER_LIVE_AUTH_FILES_ALL[@]}"
      return 0
      ;;
    none)
      return 0
      ;;
  esac
  return 0
}

zuvix_live_collect_auth_files() {
  if zuvix_live_collect_auth_files_from_override; then
    return 0
  fi
  printf '%s\n' "${ZUVIX_DOCKER_LIVE_AUTH_FILES_ALL[@]}"
}

zuvix_live_join_csv() {
  local first=1 value
  for value in "$@"; do
    [[ -n "$value" ]] || continue
    if (( first )); then
      printf '%s' "$value"
      first=0
    else
      printf ',%s' "$value"
    fi
  done
}

zuvix_live_append_array() {
  local target_array="${1:?target array required}"
  local source_array="${2:?source array required}"
  local count

  eval "count=\${#${source_array}[@]}"
  if ((count == 0)); then
    return 0
  fi
  eval "${target_array}+=(\"\${${source_array}[@]}\")"
}

zuvix_live_timeout_bin() {
  if command -v timeout >/dev/null 2>&1; then
    printf '%s\n' timeout
  elif command -v gtimeout >/dev/null 2>&1; then
    printf '%s\n' gtimeout
  else
    return 1
  fi
}

zuvix_live_timeout_supports_kill_after() {
  local timeout_bin="${1:?timeout binary required}"
  "$timeout_bin" --kill-after=1s 1s true >/dev/null 2>&1
}

zuvix_live_resource_limits_disabled() {
  case "${ZUVIX_LIVE_DOCKER_DISABLE_RESOURCE_LIMITS:-${ZUVIX_DOCKER_E2E_DISABLE_RESOURCE_LIMITS:-}}" in
    1 | true | TRUE | yes | YES | on | ON)
      return 0
      ;;
  esac
  return 1
}

zuvix_live_resource_value_disabled() {
  case "${1:-}" in
    "" | 0 | none | NONE | off | OFF | false | FALSE)
      return 0
      ;;
  esac
  return 1
}

zuvix_live_detect_available_cpus() {
  if [ -n "${ZUVIX_LIVE_DOCKER_AVAILABLE_CPUS:-${ZUVIX_DOCKER_E2E_AVAILABLE_CPUS:-}}" ]; then
    printf '%s\n' "${ZUVIX_LIVE_DOCKER_AVAILABLE_CPUS:-${ZUVIX_DOCKER_E2E_AVAILABLE_CPUS:-}}"
    return 0
  fi
  if command -v nproc >/dev/null 2>&1; then
    nproc
    return 0
  fi
  if command -v getconf >/dev/null 2>&1; then
    getconf _NPROCESSORS_ONLN
    return 0
  fi
  return 1
}

zuvix_live_resolve_cpus() {
  local requested="$1"
  local available=""
  available="$(zuvix_live_detect_available_cpus 2>/dev/null || true)"
  if [[ "$requested" =~ ^[0-9]+$ ]] && [[ "$available" =~ ^[0-9]+$ ]] && [ "$requested" -gt "$available" ]; then
    printf '%s\n' "$available"
    return 0
  fi
  printf '%s\n' "$requested"
}

zuvix_live_docker_run_resource_args() {
  local target_array="${1:?target array required}"
  eval "${target_array}=()"
  if zuvix_live_resource_limits_disabled; then
    return 0
  fi

  local memory="${ZUVIX_LIVE_DOCKER_MEMORY:-${ZUVIX_DOCKER_E2E_MEMORY:-8g}}"
  local cpus="${ZUVIX_LIVE_DOCKER_CPUS:-${ZUVIX_DOCKER_E2E_CPUS:-16}}"
  local pids_limit="${ZUVIX_LIVE_DOCKER_PIDS_LIMIT:-${ZUVIX_DOCKER_E2E_PIDS_LIMIT:-2048}}"
  cpus="$(zuvix_live_resolve_cpus "$cpus")"

  if ! zuvix_live_resource_value_disabled "$memory"; then
    eval "${target_array}+=(--memory \"\$memory\")"
  fi
  if ! zuvix_live_resource_value_disabled "$cpus"; then
    eval "${target_array}+=(--cpus \"\$cpus\")"
  fi
  if ! zuvix_live_resource_value_disabled "$pids_limit"; then
    eval "${target_array}+=(--pids-limit \"\$pids_limit\")"
  fi
}

zuvix_live_init_docker_run_args() {
  local target_array="${1:?target array required}"
  local timeout_value="${2:-${ZUVIX_LIVE_DOCKER_RUN_TIMEOUT:-2700s}}"
  local resource_args=()
  local timeout_bin
  local quoted_timeout

  if ! timeout_bin="$(zuvix_live_timeout_bin)"; then
    echo "timeout command not found; cannot bound live Docker run after ${timeout_value}" >&2
    return 127
  fi
  quoted_timeout="$(printf '%q' "$timeout_value")"
  if zuvix_live_timeout_supports_kill_after "$timeout_bin"; then
    eval "${target_array}=(${timeout_bin} --kill-after=30s ${quoted_timeout} docker run)"
  else
    eval "${target_array}=(${timeout_bin} ${quoted_timeout} docker run)"
  fi
  zuvix_live_docker_run_resource_args resource_args
  zuvix_live_append_array "$target_array" resource_args
}

zuvix_live_container_node_options() {
  local value
  value="$(zuvix_live_trim "${ZUVIX_DOCKER_NODE_OPTIONS:-${NODE_OPTIONS:-}}")"
  if [[ -z "$value" ]]; then
    value="--max-old-space-size=4096"
  fi

  case " $value " in
    *" --dns-result-order="*)
      ;;
    *)
      value="$value --dns-result-order=ipv4first"
      ;;
  esac

  case " $value " in
    *" --disable-warning=ExperimentalWarning "*)
      ;;
    *)
      value="$value --disable-warning=ExperimentalWarning"
      ;;
  esac

  printf '%s\n' "$value"
}

zuvix_live_stage_auth_into_home() {
  local dest_home="${1:?destination home directory required}"
  shift

  local mode="dirs"
  local relative_path source_path dest_path

  mkdir -p "$dest_home"
  chmod u+rwx "$dest_home" || true

  while (($# > 0)); do
    case "$1" in
      --files)
        mode="files"
        shift
        continue
        ;;
    esac

    relative_path="$(zuvix_live_validate_relative_home_path "$1")" || return 1
    source_path="$HOME/$relative_path"
    dest_path="$dest_home/$relative_path"

    if [[ "$mode" == "dirs" ]]; then
      if [[ -d "$source_path" ]]; then
        mkdir -p "$dest_path"
        cp -R "$source_path"/. "$dest_path"
        chmod -R u+rwX "$dest_path" || true
      fi
    else
      if [[ -f "$source_path" ]]; then
        mkdir -p "$(dirname "$dest_path")"
        cp "$source_path" "$dest_path"
        chmod u+rw "$dest_path" || true
      fi
    fi

    shift
  done
}

zuvix_live_prepare_bind_dir_for_container_user() {
  local dir="${1:?directory required}"

  mkdir -p "$dir"
  chmod u+rwx "$dir" || true
}

zuvix_live_stage_profile_into_home() {
  local dest_home="${1:?destination home directory required}"
  local profile_file="${2:?profile file required}"

  [[ -f "$profile_file" && -r "$profile_file" ]] || return 1
  mkdir -p "$dest_home"
  cp "$profile_file" "$dest_home/.profile"
  chmod u+rw "$dest_home/.profile" || true
}

zuvix_live_chown_bind_dirs_for_container_user() {
  local image_name="${1:?image name required}"
  local container_user="${2:?container user required}"
  shift 2

  local mount_args=()
  local index=0
  local dir
  for dir in "$@"; do
    [[ -n "$dir" ]] || continue
    mkdir -p "$dir"
    mount_args+=(-v "$dir:/zuvix-bind-dir-$index")
    index=$((index + 1))
  done
  ((index > 0)) || return 0

  local resource_args=()
  zuvix_live_docker_run_resource_args resource_args

  docker run --rm \
    "${resource_args[@]}" \
    -u 0:0 \
    --entrypoint sh \
    -e ZUVIX_BIND_DIR_USER="$container_user" \
    "${mount_args[@]}" \
    "$image_name" \
    -c 'for dir in /zuvix-bind-dir-*; do chown -R "$ZUVIX_BIND_DIR_USER" "$dir"; done'
}

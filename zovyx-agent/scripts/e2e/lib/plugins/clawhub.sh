run_plugins_clawhub_scenario() {
  if [ "${ZUVIX_PLUGINS_E2E_CLAWHUB:-1}" = "0" ]; then
    echo "Skipping ClawHub plugin install and uninstall (ZUVIX_PLUGINS_E2E_CLAWHUB=0)."
  else
    echo "Testing ClawHub plugin install and uninstall..."
    CLAWHUB_PLUGIN_SPEC="${ZUVIX_PLUGINS_E2E_CLAWHUB_SPEC:-clawhub:@zuvix/kitchen-sink}"
    CLAWHUB_PLUGIN_ID="${ZUVIX_PLUGINS_E2E_CLAWHUB_ID:-zuvix-kitchen-sink-fixture}"
    export CLAWHUB_PLUGIN_SPEC CLAWHUB_PLUGIN_ID

    start_clawhub_fixture_server() {
      local fixture_dir="$1"
      local server_log="$fixture_dir/clawhub-fixture.log"
      local server_port_file="$fixture_dir/clawhub-fixture-port"
      local server_pid_file="$fixture_dir/clawhub-fixture-pid"

      node scripts/e2e/lib/clawhub-fixture-server.cjs plugins "$server_port_file" >"$server_log" 2>&1 &
      local server_pid="$!"
      echo "$server_pid" >"$server_pid_file"
      zuvix_plugins_register_fixture_pid_file "$server_pid_file"

      for _ in $(seq 1 100); do
        if [[ -s "$server_port_file" ]]; then
          export ZUVIX_CLAWHUB_URL="http://127.0.0.1:$(cat "$server_port_file")"
          return 0
        fi
        if ! kill -0 "$server_pid" 2>/dev/null; then
          zuvix_plugins_print_fixture_log "$server_log"
          return 1
        fi
        sleep 0.1
      done

      zuvix_plugins_print_fixture_log "$server_log"
      echo "Timed out waiting for ClawHub fixture server." >&2
      return 1
    }

    if [[ "${ZUVIX_PLUGINS_E2E_LIVE_CLAWHUB:-0}" = "1" ]]; then
      export ZUVIX_CLAWHUB_URL="${ZUVIX_CLAWHUB_URL:-${CLAWHUB_URL:-https://clawhub.ai}}"
      export NPM_CONFIG_REGISTRY="${ZUVIX_PLUGINS_E2E_LIVE_NPM_REGISTRY:-https://registry.npmjs.org/}"
    else
      # Keep the release-path smoke hermetic; live ClawHub can rate-limit CI.
      if [[ -n "${ZUVIX_CLAWHUB_URL:-}" || -n "${CLAWHUB_URL:-}" ]]; then
        echo "Ignoring ambient ClawHub URL for fixture-mode plugin E2E; set ZUVIX_PLUGINS_E2E_LIVE_CLAWHUB=1 for live ClawHub."
      fi
      unset ZUVIX_CLAWHUB_URL CLAWHUB_URL
      clawhub_fixture_dir="$(mktemp -d "$ZUVIX_PLUGINS_TMP_DIR/zuvix-clawhub-fixture.XXXXXX")"
      start_clawhub_fixture_server "$clawhub_fixture_dir" || return 1
    fi

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-preflight

    run_plugins_zuvix_logged install-clawhub plugins install "$CLAWHUB_PLUGIN_SPEC"
    run_plugins_zuvix_capture "$ZUVIX_PLUGINS_TMP_DIR/plugins-clawhub-installed.json" plugins list --json
    run_plugins_zuvix_capture "$ZUVIX_PLUGINS_TMP_DIR/plugins-clawhub-inspect.json" plugins inspect "$CLAWHUB_PLUGIN_ID" --json

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-installed

    zuvix_e2e_maybe_timeout "$ZUVIX_PLUGINS_CLI_TIMEOUT" node "$ZUVIX_ENTRY" plugins update "$CLAWHUB_PLUGIN_ID" >"$ZUVIX_PLUGINS_TMP_DIR/plugins-clawhub-update.log" 2>&1
    run_plugins_zuvix_capture "$ZUVIX_PLUGINS_TMP_DIR/plugins-clawhub-updated.json" plugins list --json
    run_plugins_zuvix_capture "$ZUVIX_PLUGINS_TMP_DIR/plugins-clawhub-updated-inspect.json" plugins inspect "$CLAWHUB_PLUGIN_ID" --json

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-updated

    run_plugins_zuvix_logged uninstall-clawhub plugins uninstall "$CLAWHUB_PLUGIN_SPEC" --force
    run_plugins_zuvix_capture "$ZUVIX_PLUGINS_TMP_DIR/plugins-clawhub-uninstalled.json" plugins list --json

    node scripts/e2e/lib/plugins/assertions.mjs clawhub-removed
  fi
}

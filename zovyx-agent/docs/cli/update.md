---
summary: "CLI reference for `zuvix update` (safe-ish source update + gateway auto-restart)"
read_when:
  - You want to update a source checkout safely
  - You are debugging `zuvix update` output or options
  - You need to understand `--update` shorthand behavior
title: "Update"
---

# `zuvix update`

Safely update Zuvix and switch between stable/beta/dev channels.

If you installed via **npm/pnpm/bun** (global install, no git metadata),
updates happen via the package-manager flow in [Updating](/install/updating).

## Usage

```bash
zuvix update
zuvix update status
zuvix update repair
zuvix update wizard
zuvix update --channel beta
zuvix update --channel dev
zuvix update --tag beta
zuvix update --tag main
zuvix update --dry-run
zuvix update --no-restart
zuvix update --yes
zuvix update --json
zuvix --update
```

## Options

- `--no-restart`: skip restarting the Gateway service after a successful update. Package-manager updates that do restart the Gateway verify the restarted service reports the expected updated version before the command succeeds.
- `--channel <stable|beta|dev>`: set the update channel (git + npm; persisted in config).
- `--tag <dist-tag|version|spec>`: override the package target for this update only. For package installs, `main` maps to `github:zuvix/zuvix#main`; GitHub/git source specs are packed into a temporary tarball before the staged global npm install.
- `--dry-run`: preview planned update actions (channel/tag/target/restart flow) without writing config, installing, syncing plugins, or restarting.
- `--json`: print machine-readable `UpdateRunResult` JSON, including
  `postUpdate.plugins.warnings` when corrupt or unloadable managed plugins need
  repair after the core update succeeds, beta-channel plugin fallback details
  when a plugin has no beta release, and `postUpdate.plugins.integrityDrifts`
  when npm plugin artifact drift is detected during post-update plugin sync.
- `--timeout <seconds>`: per-step timeout (default is 1800s).
- `--yes`: skip confirmation prompts (for example downgrade confirmation).

`zuvix update` does not have a `--verbose` flag. Use `--dry-run` to preview
the planned channel/tag/install/restart actions, `--json` for machine-readable
results, and `zuvix update status --json` when you only need channel and
availability details. If you are debugging Gateway logs around an update,
console verbosity and file log level are separate: Gateway `--verbose` affects
terminal/WebSocket output, while file logs require `logging.level: "debug"` or
`"trace"` in config. See [Gateway logging](/gateway/logging).

<Note>
In Nix mode (`ZUVIX_NIX_MODE=1`), mutating `zuvix update` runs are disabled. Update the Nix source or flake input for this install instead; for nix-zuvix, use the agent-first [Quick Start](https://github.com/zuvix/nix-zuvix#quick-start). `zuvix update status` and `zuvix update --dry-run` remain read-only.
</Note>

<Warning>
Downgrades require confirmation because older versions can break configuration.
</Warning>

## `update status`

Show the active update channel + git tag/branch/SHA (for source checkouts), plus update availability.

```bash
zuvix update status
zuvix update status --json
zuvix update status --timeout 10
```

Options:

- `--json`: print machine-readable status JSON.
- `--timeout <seconds>`: timeout for checks (default is 3s).

## `update repair`

Rerun update finalization after the core package already changed but later
repair work did not finish cleanly. This is the supported recovery path when
`zuvix update` installed the new core package but post-core plugin sync,
managed npm plugin metadata, registry refresh, or doctor repair still needs to
converge.

```bash
zuvix update repair
zuvix update repair --channel beta
zuvix update repair --json
```

Options:

- `--channel <stable|beta|dev>`: persist the update channel before repair and
  run plugin convergence against that channel.
- `--json`: print machine-readable finalization JSON.
- `--timeout <seconds>`: timeout for repair steps (default `1800`).
- `--yes`: skip confirmation prompts.
- `--no-restart`: accepted for update command parity; repair never restarts the
  Gateway.

`zuvix update repair` runs `zuvix doctor --fix`, reloads the repaired
config and install records, syncs tracked plugins for the active update channel,
updates managed npm plugin installs, repairs missing configured plugin payloads,
refreshes the plugin registry, and writes the converged install-record metadata.
It does not install a new core package and does not restart the Gateway.

## `update wizard`

Interactive flow to pick an update channel and confirm whether to restart the Gateway
after updating (default is to restart). If you select `dev` without a git checkout, it
offers to create one.

Options:

- `--timeout <seconds>`: timeout for each update step (default `1800`)

## What it does

When you switch channels explicitly (`--channel ...`), Zuvix also keeps the
install method aligned:

- `dev` → ensures a git checkout (default: `~/zuvix`, or `$ZUVIX_HOME/zuvix` when
  `ZUVIX_HOME` is set; override with `ZUVIX_GIT_DIR`),
  updates it, and installs the global CLI from that checkout.
- `stable` → installs from npm using `latest`.
- `beta` → prefers npm dist-tag `beta`, but falls back to `latest` when beta is
  missing or older than the current stable release.

The Gateway core auto-updater (when enabled via config) launches the CLI update path
outside the live Gateway request handler. Control-plane `update.run`
package-manager updates and supervised git-checkout updates also use a
managed-service handoff instead of replacing the package tree or rebuilding
`dist/` inside the live Gateway process. The Gateway starts a detached helper,
exits, and the helper runs the normal `zuvix update --yes --json` CLI path
from outside the Gateway process tree. If that handoff is unavailable,
`update.run` returns a structured response with the safe shell command to run
manually.

For package-manager installs, `zuvix update` resolves the target package
version before invoking the package manager. npm global installs use a staged
install: Zuvix installs the new package into a temporary npm prefix, verifies
the packaged `dist` inventory there, then swaps that clean package tree into the
real global prefix. If verification fails, post-update doctor, plugin sync, and
restart work do not run from the suspect tree. Even when the installed version
already matches the target, the command refreshes the global package install,
then runs plugin sync, a core-command completion refresh, and restart work. This
keeps packaged sidecars and channel-owned plugin records aligned with the
installed Zuvix build while leaving full plugin-command completion rebuilds to
explicit `zuvix completion --write-state` runs.

When a local managed Gateway service is installed and restart is enabled,
package-manager and git-checkout updates stop the running service before
replacing the package tree or mutating the checkout/build output. The updater
then refreshes the service metadata from the updated install, restarts the
service, and verifies the restarted Gateway before reporting
`Gateway: restarted and verified.`. Package-manager updates additionally verify
the restarted Gateway reports the expected package version; git-checkout updates
verify gateway health and service readiness after the rebuild. On macOS, the
post-update check also verifies the LaunchAgent is loaded/running for the active
profile and the configured loopback port is healthy. If the plist is installed
but launchd is not supervising it, Zuvix re-bootstraps the LaunchAgent
automatically, then reruns the health/version/channel readiness checks. A fresh
bootstrap loads the RunAtLoad job directly, so update recovery does not
immediately `kickstart -k` the newly spawned Gateway. If the Gateway still does
not become healthy, the command exits non-zero and prints the restart log path
plus explicit restart, reinstall, and package rollback instructions. If restart
cannot run, the command prints `Gateway: restart skipped (...)` or
`Gateway: restart failed: ...` with a manual `zuvix gateway restart` hint.
With `--no-restart`, package replacement or git rebuild still runs but the
managed service is not stopped or restarted, so the running Gateway may keep old
code until you restart it manually.

### Control-plane response shape

When `update.run` is invoked through the Gateway control plane on a
package-manager install or supervised git checkout, the handler reports the
handoff initiation separately from the CLI update that continues after the
Gateway exits:

- `ok: true`, `result.status: "skipped"`,
  `result.reason: "managed-service-handoff-started"`, and
  `handoff.status: "started"` mean the Gateway created the managed-service
  handoff and scheduled its own restart so the detached helper can run
  `zuvix update --yes --json` outside the live service process.
- `ok: false`, `result.reason: "managed-service-handoff-unavailable"`, and
  `handoff.status: "unavailable"` mean Zuvix could not find a supervising
  service boundary and durable service identity for a safe handoff. For
  example, systemd handoff requires the Zuvix unit identity
  (`ZUVIX_SYSTEMD_UNIT`), not only ambient systemd process markers. The
  response includes `handoff.command`, the shell command to run from outside the
  Gateway.
- `ok: false`, `result.reason: "managed-service-handoff-failed"` means the
  Gateway tried to create the handoff but could not spawn the detached helper.

The `sentinel` payload is still written before the Gateway exits, and the CLI
handoff updates the same restart sentinel after the managed-service restart
health checks complete. During the handoff, the sentinel can carry
`stats.reason: "restart-health-pending"` with no success continuation; the
restarted Gateway keeps polling it and only fires the continuation after the CLI
has verified service health and rewritten the sentinel with the final `ok`
result. `zuvix status` and `zuvix status --all` show an `Update restart`
row while that sentinel is pending or failed, and `update.status` refreshes and
returns the latest sentinel.

## Git checkout flow

### Channel selection

- `stable`: checkout the latest non-beta tag, then build and doctor.
- `beta`: prefer the latest `-beta` tag, but fall back to the latest stable tag when beta is missing or older.
- `dev`: checkout `main`, then fetch and rebase.

### Update steps

<Steps>
  <Step title="Verify clean worktree">
    Requires no uncommitted changes.
  </Step>
  <Step title="Switch channel">
    Switches to the selected channel (tag or branch).
  </Step>
  <Step title="Fetch upstream">
    Dev only.
  </Step>
  <Step title="Preflight build (dev only)">
    Runs the TypeScript build in a temp worktree. If the tip fails, walks back up to 10 commits to find the newest buildable commit. Set `ZUVIX_UPDATE_PREFLIGHT_LINT=1` to also run lint during this preflight; lint runs in constrained serial mode because user update hosts are often smaller than CI runners.
  </Step>
  <Step title="Rebase">
    Rebases onto the selected commit (dev only).
  </Step>
  <Step title="Install dependencies">
    Uses the repo package manager. For pnpm checkouts, the updater bootstraps `pnpm` on demand (via `corepack` first, then a temporary `npm install pnpm@11` fallback) instead of running `npm run build` inside a pnpm workspace.
  </Step>
  <Step title="Build Control UI">
    Builds the gateway and the Control UI.
  </Step>
  <Step title="Run doctor">
    `zuvix doctor` runs as the final safe-update check.
  </Step>
  <Step title="Sync plugins">
    Syncs plugins to the active channel. Dev uses bundled plugins; stable and beta use npm. Updates tracked plugin installs.
  </Step>
</Steps>

On the beta update channel, tracked npm and ClawHub plugin installs that follow
the default/latest line try a plugin `@beta` release first. If the plugin has no
beta release, Zuvix falls back to the recorded default/latest spec and reports
that as a warning. For npm plugins, Zuvix also falls back when the beta
package exists but fails install validation. These plugin fallback warnings do
not make the core update fail. Exact versions and explicit tags are not
rewritten.

<Warning>
If an exact pinned npm plugin update resolves to an artifact whose integrity differs from the stored install record, `zuvix update` aborts that plugin artifact update instead of installing it. Reinstall or update the plugin explicitly only after verifying that you trust the new artifact.
</Warning>

<Note>
Post-update plugin sync failures that are scoped to a managed plugin and that the sync path can route around (e.g. an unreachable npm registry for a non-essential plugin) are reported as warnings after the core update succeeds. The JSON result keeps the top-level update `status: "ok"` and reports `postUpdate.plugins.status: "warning"` with `zuvix update repair` and `zuvix plugins inspect <id> --runtime --json` guidance. Unexpected updater or sync exceptions still fail the update result. Fix the plugin install or update error, then rerun `zuvix update repair`.

After the per-plugin sync step, `zuvix update` runs a mandatory **post-core convergence** pass before the gateway is restarted: it repairs missing configured plugin payloads, validates each _active_ tracked install record on disk, and statically verifies its `package.json` is parseable (and any explicitly-declared `main` exists). Failures from this pass — and an invalid Zuvix config snapshot — return `postUpdate.plugins.status: "error"` and flip the top-level update `status` to `"error"`, so `zuvix update` exits non-zero and the gateway is _not_ restarted with an unverified plugin set. The error includes structured `postUpdate.plugins.warnings[].guidance` lines pointing at `zuvix update repair` and `zuvix plugins inspect <id> --runtime --json` for follow-up. Disabled plugin entries and records that are not trusted-source-linked official sync targets are skipped here, mirroring the `skipDisabledPlugins` policy used by the missing-payload check, so a stale disabled plugin record cannot block an otherwise valid update.

When the updated Gateway starts, plugin loading is verify-only: startup does not
run package managers or mutate dependency trees. Package-manager `update.run`
restarts are handed to the CLI managed-service path, so the package swap happens
outside the old Gateway process and the service health checks decide whether the
update can be reported as complete.

If pnpm bootstrap still fails, the updater stops early with a package-manager-specific error instead of trying `npm run build` inside the checkout.
</Note>

## `--update` shorthand

`zuvix --update` rewrites to `zuvix update` (useful for shells and launcher scripts).

## Related

- `zuvix doctor` (offers to run update first on git checkouts)
- [Development channels](/install/development-channels)
- [Updating](/install/updating)
- [CLI reference](/cli)

---
summary: "Uninstall Zuvix completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Zuvix from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

Two paths:

- **Easy path** if `zuvix` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
zuvix uninstall
```

When using the CLI, state removal preserves configured workspace directories unless you also select `--workspace`.

Preview what will be removed (safe):

```bash
zuvix uninstall --dry-run --all
```

Non-interactive (automation / npx). Use with caution and only after confirming scopes:

```bash
zuvix uninstall --all --yes --non-interactive
npx -y zuvix uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
zuvix gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
zuvix gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${ZUVIX_STATE_DIR:-$HOME/.zuvix}"
```

If you set `ZUVIX_CONFIG_PATH` to a custom location outside the state dir, delete that file too.
If you want to keep a workspace inside the state dir, such as `~/.zuvix/workspace`, move it aside before running `rm -rf` or delete state contents selectively.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.zuvix/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g zuvix
pnpm remove -g zuvix
bun remove -g zuvix
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Zuvix.app
```

Notes:

- If you used profiles (`--profile` / `ZUVIX_PROFILE`), repeat step 3 for each state dir (defaults are `~/.zuvix-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `zuvix` is missing.

### macOS (launchd)

Default label is `ai.zuvix.gateway` (or `ai.zuvix.<profile>`; legacy `com.zuvix.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.zuvix.gateway
rm -f ~/Library/LaunchAgents/ai.zuvix.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.zuvix.<profile>`. Remove any legacy `com.zuvix.*` plists if present.

### Linux (systemd user unit)

Default unit name is `zuvix-gateway.service` (or `zuvix-gateway-<profile>.service`):

```bash
systemctl --user disable --now zuvix-gateway.service
rm -f ~/.config/systemd/user/zuvix-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Zuvix Gateway` (or `Zuvix Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Zuvix Gateway"
Remove-Item -Force "$env:USERPROFILE\.zuvix\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.zuvix-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://zuvix.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g zuvix@latest`.
Remove it with `npm rm -g zuvix` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `zuvix ...` / `bun run zuvix ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.

## Related

- [Install overview](/install)
- [Migration guide](/install/migrating)

---
summary: "Zuvix browser control API, CLI reference, and scripting actions"
read_when:
  - Scripting or debugging the agent browser via the local control API
  - Looking for the `zuvix browser` CLI reference
  - Adding custom browser automation with snapshots and refs
title: "Browser control API"
---

For setup, configuration, and troubleshooting, see [Browser](/tools/browser).
This page is the reference for the local control HTTP API, the `zuvix browser`
CLI, and scripting patterns (snapshots, refs, waits, debug flows).

## Control API (optional)

For local integrations only, the Gateway exposes a small loopback HTTP API.
This standalone server is opt-in — set the environment variable
`ZUVIX_EAGER_BROWSER_CONTROL_SERVER=1` in the gateway service environment
and restart the gateway before the HTTP endpoints become available. Without
this variable the browser control runtime still works through the CLI and
agent tools, but nothing listens on the loopback control port.

- Status/start/stop: `GET /`, `POST /start`, `POST /stop`
- Tabs: `GET /tabs`, `POST /tabs/open`, `POST /tabs/focus`, `DELETE /tabs/:targetId`
- Snapshot/screenshot: `GET /snapshot`, `POST /screenshot`
- Actions: `POST /navigate`, `POST /act`
- Hooks: `POST /hooks/file-chooser`, `POST /hooks/dialog`
- Downloads: `POST /download`, `POST /wait/download`
- Permissions: `POST /permissions/grant`
- Debugging: `GET /console`, `POST /pdf`
- Debugging: `GET /errors`, `GET /requests`, `POST /trace/start`, `POST /trace/stop`, `POST /highlight`
- Network: `POST /response/body`
- State: `GET /cookies`, `POST /cookies/set`, `POST /cookies/clear`
- State: `GET /storage/:kind`, `POST /storage/:kind/set`, `POST /storage/:kind/clear`
- Settings: `POST /set/offline`, `POST /set/headers`, `POST /set/credentials`, `POST /set/geolocation`, `POST /set/media`, `POST /set/timezone`, `POST /set/locale`, `POST /set/device`

All endpoints accept `?profile=<name>`. `POST /start?headless=true` requests a
one-shot headless launch for local managed profiles without changing persisted
browser config; attach-only, remote CDP, and existing-session profiles reject
that override because Zuvix does not launch those browser processes.

For tab endpoints, `targetId` is the compatibility field name. Prefer passing
`suggestedTargetId` from `GET /tabs` or `POST /tabs/open`; labels and `tabId`
handles such as `t1` are also accepted. Raw CDP target ids and unique raw
target-id prefixes still work, but they are volatile diagnostic handles.

If shared-secret gateway auth is configured, browser HTTP routes require auth too:

- `Authorization: Bearer <gateway token>`
- `x-zuvix-password: <gateway password>` or HTTP Basic auth with that password

Notes:

- This standalone loopback browser API does **not** consume trusted-proxy or
  Tailscale Serve identity headers.
- If `gateway.auth.mode` is `none` or `trusted-proxy`, these loopback browser
  routes do not inherit those identity-bearing modes; keep them loopback-only.

### `/act` error contract

`POST /act` uses a structured error response for route-level validation and
policy failures:

```json
{ "error": "<message>", "code": "ACT_*" }
```

Current `code` values:

- `ACT_KIND_REQUIRED` (HTTP 400): `kind` is missing or unrecognized.
- `ACT_INVALID_REQUEST` (HTTP 400): action payload failed normalization or validation.
- `ACT_SELECTOR_UNSUPPORTED` (HTTP 400): `selector` was used with an unsupported action kind.
- `ACT_EVALUATE_DISABLED` (HTTP 403): `evaluate` (or `wait --fn`) is disabled by config.
- `ACT_TARGET_ID_MISMATCH` (HTTP 403): top-level or batched `targetId` conflicts with request target.
- `ACT_EXISTING_SESSION_UNSUPPORTED` (HTTP 501): action is not supported for existing-session profiles.

Other runtime failures may still return `{ "error": "<message>" }` without a
`code` field.

### Playwright requirement

Some features (navigate/act/AI snapshot/role snapshot, element screenshots,
PDF) require Playwright. If Playwright isn't installed, those endpoints return
a clear 501 error.

What still works without Playwright:

- ARIA snapshots
- Role-style accessibility snapshots (`--interactive`, `--compact`,
  `--depth`, `--efficient`) when a per-tab CDP WebSocket is available. This is
  a fallback for inspection and ref discovery; Playwright remains the primary
  action engine.
- Page screenshots for the managed `zuvix` browser when a per-tab CDP
  WebSocket is available
- Page screenshots for `existing-session` / Chrome MCP profiles
- `existing-session` ref-based screenshots (`--ref`) from snapshot output

What still needs Playwright:

- `navigate`
- `act`
- AI snapshots that depend on Playwright's native AI snapshot format
- CSS-selector element screenshots (`--element`)
- full browser PDF export

Element screenshots also reject `--full-page`; the route returns `fullPage is
not supported for element screenshots`.

If you see `Playwright is not available in this gateway build`, the packaged
Gateway is missing the core browser runtime dependency. Reinstall or update
Zuvix, then restart the gateway. For Docker, also install the Chromium
browser binaries as shown below.

#### Docker Playwright install

If your Gateway runs in Docker, avoid `npx playwright` (npm override conflicts).
For custom images, bake Chromium into the image:

```bash
ZUVIX_INSTALL_BROWSER=1 ./scripts/docker/setup.sh
```

For an existing image, install through the bundled CLI instead:

```bash
docker compose run --rm zuvix-cli \
  node /app/node_modules/playwright-core/cli.js install chromium
```

To persist browser downloads, set `PLAYWRIGHT_BROWSERS_PATH` (for example,
`/home/node/.cache/ms-playwright`) and make sure `/home/node` is persisted via
`ZUVIX_HOME_VOLUME` or a bind mount. Zuvix auto-detects the persisted
Chromium on Linux. See [Docker](/install/docker).

## How it works (internal)

A small loopback control server accepts HTTP requests and connects to Chromium-based browsers via CDP. Advanced actions (click/type/snapshot/PDF) go through Playwright on top of CDP; when Playwright is missing, only non-Playwright operations are available. The agent sees one stable interface while local/remote browsers and profiles swap freely underneath.

## CLI quick reference

All commands accept `--browser-profile <name>` to target a specific profile, and `--json` for machine-readable output.

<AccordionGroup>

<Accordion title="Basics: status, tabs, open/focus/close">

```bash
zuvix browser status
zuvix browser start
zuvix browser start --headless # one-shot local managed headless launch
zuvix browser stop            # also clears emulation on attach-only/remote CDP
zuvix browser tabs
zuvix browser tab             # shortcut for current tab
zuvix browser tab new
zuvix browser tab select 2
zuvix browser tab close 2
zuvix browser open https://example.com
zuvix browser focus abcd1234
zuvix browser close abcd1234
```

</Accordion>

<Accordion title="Inspection: screenshot, snapshot, console, errors, requests">

```bash
zuvix browser screenshot
zuvix browser screenshot --full-page
zuvix browser screenshot --ref 12        # or --ref e12
zuvix browser screenshot --labels
zuvix browser snapshot
zuvix browser snapshot --format aria --limit 200
zuvix browser snapshot --interactive --compact --depth 6
zuvix browser snapshot --efficient
zuvix browser snapshot --labels
zuvix browser snapshot --urls
zuvix browser snapshot --selector "#main" --interactive
zuvix browser snapshot --frame "iframe#main" --interactive
zuvix browser console --level error
zuvix browser errors --clear
zuvix browser requests --filter api --clear
zuvix browser pdf
zuvix browser responsebody "**/api" --max-chars 5000
```

</Accordion>

<Accordion title="Actions: navigate, click, type, drag, wait, evaluate">

```bash
zuvix browser navigate https://example.com
zuvix browser resize 1280 720
zuvix browser click 12 --double           # or e12 for role refs
zuvix browser click-coords 120 340        # viewport coordinates
zuvix browser type 23 "hello" --submit
zuvix browser press Enter
zuvix browser hover 44
zuvix browser scrollintoview e12
zuvix browser drag 10 11
zuvix browser select 9 OptionA OptionB
zuvix browser download e12 report.pdf
zuvix browser waitfordownload report.pdf
zuvix browser upload /tmp/zuvix/uploads/file.pdf
zuvix browser upload media://inbound/file.pdf
zuvix browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]'
zuvix browser dialog --accept
zuvix browser dialog --dismiss --dialog-id d1
zuvix browser wait --text "Done"
zuvix browser wait "#main" --url "**/dash" --load networkidle --fn "window.ready===true"
zuvix browser evaluate --fn '(el) => el.textContent' --ref 7
zuvix browser evaluate --fn 'const title = document.title; return title;'
zuvix browser evaluate --timeout-ms 30000 --fn 'async () => { await window.ready; return true; }'
zuvix browser highlight e12
zuvix browser trace start
zuvix browser trace stop
```

</Accordion>

<Accordion title="State: cookies, storage, offline, headers, geo, device">

```bash
zuvix browser cookies
zuvix browser cookies set session abc123 --url "https://example.com"
zuvix browser cookies clear
zuvix browser storage local get
zuvix browser storage local set theme dark
zuvix browser storage session clear
zuvix browser set offline on
zuvix browser set headers --headers-json '{"X-Debug":"1"}'
zuvix browser set credentials user pass            # --clear to remove
zuvix browser set geo 37.7749 -122.4194 --origin "https://example.com"
zuvix browser set media dark
zuvix browser set timezone America/New_York
zuvix browser set locale en-US
zuvix browser set device "iPhone 14"
```

</Accordion>

</AccordionGroup>

Notes:

- `upload` and `dialog` are **arming** calls; run them before the click/press that triggers the chooser/dialog. If an action opens a modal, the action response includes `blockedByDialog` and `browserState.dialogs.pending`; pass that `dialogId` to respond directly. Dialogs handled outside Zuvix appear under `browserState.dialogs.recent`.
- `click`/`type`/etc require a `ref` from `snapshot` (numeric `12`, role ref `e12`, or actionable ARIA ref `ax12`). CSS selectors are intentionally not supported for actions. Use `click-coords` when the visible viewport position is the only reliable target.
- Download and trace paths are constrained to Zuvix temp roots: `/tmp/zuvix{,/downloads}` (fallback: `${os.tmpdir()}/zuvix/...`).
- `upload` accepts files from the Zuvix temp uploads root and
  Zuvix-managed inbound media. Managed inbound media can be referenced as
  `media://inbound/<id>`, sandbox-relative `media/inbound/<id>`, or a resolved
  path inside the managed inbound media directory. Nested media refs,
  traversal, symlinks, hardlinks, and arbitrary local paths are still rejected.
- `upload` can also set file inputs directly via `--input-ref` or `--element`.

Stable tab ids and labels survive Chromium raw-target replacement when Zuvix
can prove the replacement tab, such as same URL or a single old tab becoming a
single new tab after form submission. Raw target ids are still volatile; prefer
`suggestedTargetId` from `tabs` in scripts.

Snapshot flags at a glance:

- `--format ai` (default with Playwright): AI snapshot with numeric refs (`aria-ref="<n>"`).
- `--format aria`: accessibility tree with `axN` refs. When Playwright is available, Zuvix binds refs with backend DOM ids to the live page so follow-up actions can use them; otherwise treat the output as inspection-only.
- `--efficient` (or `--mode efficient`): compact role snapshot preset. Set `browser.snapshotDefaults.mode: "efficient"` to make this the default (see [Gateway configuration](/gateway/configuration-reference#browser)).
- `--interactive`, `--compact`, `--depth`, `--selector` force a role snapshot with `ref=e12` refs. `--frame "<iframe>"` scopes role snapshots to an iframe.
- With Playwright, `--labels` adds a screenshot with overlayed ref labels
  (prints `MEDIA:<path>`) plus an `annotations` array with each ref's bounding
  box. On `screenshot`, Playwright-backed labels work with `--full-page`,
  `--ref`, and `--element`; on `snapshot`, the accompanying screenshot remains
  viewport-only. Existing-session/chrome-mcp profiles render overlay labels on
  page screenshots but do not return `annotations` or use the Playwright
  full-page/ref/element projection helper. Without Playwright or chrome-mcp,
  labeled screenshots are not available.
- `--urls` appends discovered link destinations to AI snapshots.

## Snapshots and refs

Zuvix supports two "snapshot" styles:

- **AI snapshot (numeric refs)**: `zuvix browser snapshot` (default; `--format ai`)
  - Output: a text snapshot that includes numeric refs.
  - Actions: `zuvix browser click 12`, `zuvix browser type 23 "hello"`.
  - Internally, the ref is resolved via Playwright's `aria-ref`.

- **Role snapshot (role refs like `e12`)**: `zuvix browser snapshot --interactive` (or `--compact`, `--depth`, `--selector`, `--frame`)
  - Output: a role-based list/tree with `[ref=e12]` (and optional `[nth=1]`).
  - Actions: `zuvix browser click e12`, `zuvix browser highlight e12`.
  - Internally, the ref is resolved via `getByRole(...)` (plus `nth()` for duplicates).
  - Add `--labels` to include a screenshot with overlayed `e12` labels. On
    Playwright-backed profiles this also returns per-ref bounding-box metadata
    (`annotations[]`).
  - Add `--urls` when link text is ambiguous and the agent needs concrete
    navigation targets.

- **ARIA snapshot (ARIA refs like `ax12`)**: `zuvix browser snapshot --format aria`
  - Output: the accessibility tree as structured nodes.
  - Actions: `zuvix browser click ax12` works when the snapshot path can bind
    the ref through Playwright and Chrome backend DOM ids.
- If Playwright is unavailable, ARIA snapshots can still be useful for
  inspection, but refs may not be actionable. Re-snapshot with `--format ai`
  or `--interactive` when you need action refs.
- Docker proof for the raw-CDP fallback path: `pnpm test:docker:browser-cdp-snapshot`
  starts Chromium with CDP, runs `browser doctor --deep`, and verifies role
  snapshots include link URLs, cursor-promoted clickables, and iframe metadata.

Ref behavior:

- Refs are **not stable across navigations**; if something fails, re-run `snapshot` and use a fresh ref.
- `/act` returns the current raw `targetId` after action-triggered replacement
  when it can prove the replacement tab. Keep using stable tab ids/labels for
  follow-up commands.
- If the role snapshot was taken with `--frame`, role refs are scoped to that iframe until the next role snapshot.
- Unknown or stale `axN` refs fail fast instead of falling through to
  Playwright's `aria-ref` selector. Run a fresh snapshot on the same tab when
  that happens.

## Wait power-ups

You can wait on more than just time/text:

- Wait for URL (globs supported by Playwright):
  - `zuvix browser wait --url "**/dash"`
- Wait for load state:
  - `zuvix browser wait --load networkidle`
- Wait for a JS predicate:
  - `zuvix browser wait --fn "window.ready===true"`
- Wait for a selector to become visible:
  - `zuvix browser wait "#main"`

These can be combined:

```bash
zuvix browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
```

## Debug workflows

When an action fails (e.g. "not visible", "strict mode violation", "covered"):

1. `zuvix browser snapshot --interactive`
2. Use `click <ref>` / `type <ref>` (prefer role refs in interactive mode)
3. If it still fails: `zuvix browser highlight <ref>` to see what Playwright is targeting
4. If the page behaves oddly:
   - `zuvix browser errors --clear`
   - `zuvix browser requests --filter api --clear`
5. For deep debugging: record a trace:
   - `zuvix browser trace start`
   - reproduce the issue
   - `zuvix browser trace stop` (prints `TRACE:<path>`)

## JSON output

`--json` is for scripting and structured tooling.

Examples:

```bash
zuvix browser status --json
zuvix browser snapshot --interactive --json
zuvix browser requests --filter api --json
zuvix browser cookies --json
```

Role snapshots in JSON include `refs` plus a small `stats` block (lines/chars/refs/interactive) so tools can reason about payload size and density.

## State and environment knobs

These are useful for "make the site behave like X" workflows:

- Cookies: `cookies`, `cookies set`, `cookies clear`
- Storage: `storage local|session get|set|clear`
- Offline: `set offline on|off`
- Headers: `set headers --headers-json '{"X-Debug":"1"}'` (legacy `set headers --json '{"X-Debug":"1"}'` remains supported)
- HTTP basic auth: `set credentials user pass` (or `--clear`)
- Geolocation: `set geo <lat> <lon> --origin "https://example.com"` (or `--clear`)
- Media: `set media dark|light|no-preference|none`
- Timezone / locale: `set timezone ...`, `set locale ...`
- Device / viewport:
  - `set device "iPhone 14"` (Playwright device presets)
  - `set viewport 1280 720`

## Security and privacy

- The zuvix browser profile may contain logged-in sessions; treat it as sensitive.
- `browser act kind=evaluate` / `zuvix browser evaluate` and `wait --fn`
  execute arbitrary JavaScript in the page context. Prompt injection can steer
  this. Disable it with `browser.evaluateEnabled=false` if you do not need it.
- `zuvix browser evaluate --fn` accepts a function source, an expression, or
  a statement body. Statement bodies are wrapped as async functions, so use
  `return` for the value you want back. Use `--timeout-ms <ms>` when the
  page-side function may need longer than the default evaluate timeout.
- For logins and anti-bot notes (X/Twitter, etc.), see [Browser login + X/Twitter posting](/tools/browser-login).
- Keep the Gateway/node host private (loopback or tailnet-only).
- Remote CDP endpoints are powerful; tunnel and protect them.

Strict-mode example (block private/internal destinations by default):

```json5
{
  browser: {
    ssrfPolicy: {
      dangerouslyAllowPrivateNetwork: false,
      hostnameAllowlist: ["*.example.com", "example.com"],
      allowedHostnames: ["localhost"], // optional exact allow
    },
  },
}
```

## Related

- [Browser](/tools/browser) - overview, configuration, profiles, security
- [Browser login](/tools/browser-login) - signing in to sites
- [Browser Linux troubleshooting](/tools/browser-linux-troubleshooting)
- [Browser WSL2 troubleshooting](/tools/browser-wsl2-windows-remote-cdp-troubleshooting)

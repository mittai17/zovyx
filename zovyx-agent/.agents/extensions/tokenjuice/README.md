# @zuvix/tokenjuice

Official Tokenjuice output compaction plugin for Zuvix.

Tokenjuice compacts noisy `exec` and `bash` tool results after commands run, before the result is fed back into the active agent session. It does not rewrite commands, rerun commands, or change exit codes.

## Install

```bash
zuvix plugins install @zuvix/tokenjuice
```

Restart the Gateway after installing or updating the plugin.

## Enable

```bash
zuvix config set plugins.entries.tokenjuice.enabled true
```

Equivalent:

```bash
zuvix plugins enable tokenjuice
```

## Docs

- https://docs.zuvix.ai/tools/tokenjuice

## Package

- Plugin id: `tokenjuice`
- Package: `@zuvix/tokenjuice`
- Minimum Zuvix host: `2026.5.28`

# @zuvix/acpx

Official ACP runtime backend for Zuvix.

ACPx lets Zuvix run external coding harnesses through the Agent Client Protocol while Zuvix still owns sessions, channels, delivery, permissions, and Gateway state.

## Install

```bash
zuvix plugins install @zuvix/acpx
```

Restart the Gateway after installing or updating the plugin.

## What it provides

- ACP-backed agent runtime sessions.
- Plugin-owned session and transport management.
- MCP bridge helpers for Zuvix tools and plugin tools.
- Static runtime assets used by the ACP process bridge.

## Configure

Use the ACP docs for harness-specific setup, permission modes, and model/runtime selection:

- https://docs.zuvix.ai/tools/acp-agents-setup
- https://docs.zuvix.ai/tools/acp-agents

## Package

- Plugin id: `acpx`
- Package: `@zuvix/acpx`
- Minimum Zuvix host: `2026.4.25`

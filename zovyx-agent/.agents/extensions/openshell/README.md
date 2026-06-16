# @zuvix/openshell-sandbox

Official NVIDIA OpenShell sandbox backend for Zuvix.

This plugin lets Zuvix use OpenShell-managed sandboxes with mirrored local workspaces and SSH command execution.

## Install

```bash
zuvix plugins install @zuvix/openshell-sandbox
```

Restart the Gateway after installing or updating the plugin.

## Configure

Use the OpenShell docs for credentials, workspace mirroring, runtime selection, and troubleshooting:

- https://docs.zuvix.ai/gateway/openshell

## Package

- Plugin id: `openshell`
- Package: `@zuvix/openshell-sandbox`
- Minimum Zuvix host: `2026.5.12-beta.1`

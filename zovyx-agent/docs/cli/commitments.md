---
summary: "CLI reference for `zuvix commitments` (inspect and dismiss inferred follow-ups)"
read_when:
  - You want to inspect inferred follow-up commitments
  - You want to dismiss pending check-ins
  - You are auditing what heartbeat may deliver
title: "`zuvix commitments`"
---

List and manage inferred follow-up commitments.

Commitments are opt-in, short-lived follow-up memories created from
conversation context. See [Inferred commitments](/concepts/commitments) for the
conceptual guide.

With no subcommand, `zuvix commitments` lists pending commitments.

## Usage

```bash
zuvix commitments [--all] [--agent <id>] [--status <status>] [--json]
zuvix commitments list [--all] [--agent <id>] [--status <status>] [--json]
zuvix commitments dismiss <id...> [--json]
```

## Options

- `--all`: show all statuses instead of only pending commitments.
- `--agent <id>`: filter to one agent id.
- `--status <status>`: filter by status. Values: `pending`, `sent`,
  `dismissed`, `snoozed`, or `expired`.
- `--json`: output machine-readable JSON.

## Examples

List pending commitments:

```bash
zuvix commitments
```

List every stored commitment:

```bash
zuvix commitments --all
```

Filter to one agent:

```bash
zuvix commitments --agent main
```

Find snoozed commitments:

```bash
zuvix commitments --status snoozed
```

Dismiss one or more commitments:

```bash
zuvix commitments dismiss cm_abc123 cm_def456
```

Export as JSON:

```bash
zuvix commitments --all --json
```

## Output

Text output includes:

- commitment id
- status
- kind
- earliest due time
- scope
- suggested check-in text

JSON output also includes the commitment store path and full stored records.

## Related

- [Inferred commitments](/concepts/commitments)
- [Memory overview](/concepts/memory)
- [Heartbeat](/gateway/heartbeat)
- [Scheduled tasks](/automation/cron-jobs)

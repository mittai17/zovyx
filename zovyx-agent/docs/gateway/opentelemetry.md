---
summary: "Export Zuvix diagnostics to any OpenTelemetry collector via the diagnostics-otel plugin (OTLP/HTTP)"
title: "OpenTelemetry export"
read_when:
  - You want to send Zuvix model usage, message flow, or session metrics to an OpenTelemetry collector
  - You are wiring traces, metrics, or logs into Grafana, Datadog, Honeycomb, New Relic, Tempo, or another OTLP backend
  - You need the exact metric names, span names, or attribute shapes to build dashboards or alerts
---

Zuvix exports diagnostics through the official `diagnostics-otel` plugin
using **OTLP/HTTP (protobuf)**. Any collector or backend that accepts OTLP/HTTP
works without code changes. For local file logs and how to read them, see
[Logging](/logging).

## How it fits together

- **Diagnostics events** are structured, in-process records emitted by the
  Gateway and bundled plugins for model runs, message flow, sessions, queues,
  and exec.
- **`diagnostics-otel` plugin** subscribes to those events and exports them as
  OpenTelemetry **metrics**, **traces**, and **logs** over OTLP/HTTP.
- **Provider calls** receive a W3C `traceparent` header from Zuvix's
  trusted model-call span context when the provider transport accepts custom
  headers. Plugin-emitted trace context is not propagated.
- Exporters only attach when both the diagnostics surface and the plugin are
  enabled, so the in-process cost stays near zero by default.

## Quick start

For packaged installs, install the plugin first:

```bash
zuvix plugins install clawhub:@zuvix/diagnostics-otel
```

```json5
{
  plugins: {
    allow: ["diagnostics-otel"],
    entries: {
      "diagnostics-otel": { enabled: true },
    },
  },
  diagnostics: {
    enabled: true,
    otel: {
      enabled: true,
      endpoint: "http://otel-collector:4318",
      protocol: "http/protobuf",
      serviceName: "zuvix-gateway",
      traces: true,
      metrics: true,
      logs: true,
      sampleRate: 0.2,
      flushIntervalMs: 60000,
    },
  },
}
```

You can also enable the plugin from the CLI:

```bash
zuvix plugins enable diagnostics-otel
```

<Note>
`protocol` currently supports `http/protobuf` only. `grpc` is ignored.
</Note>

## Signals exported

| Signal      | What goes in it                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Metrics** | Counters and histograms for token usage, cost, run duration, failover, skill usage, message flow, Talk events, queue lanes, session state/recovery, tool execution, oversized payloads, exec, and memory pressure. |
| **Traces**  | Spans for model usage, model calls, harness lifecycle, skill usage, tool execution, exec, webhook/message processing, context assembly, and tool loops.                                                            |
| **Logs**    | Structured `logging.file` records exported over OTLP when `diagnostics.otel.logs` is enabled; log bodies are withheld unless content capture is explicitly enabled.                                                |

Toggle `traces`, `metrics`, and `logs` independently. Traces and metrics
default to on when `diagnostics.otel.enabled` is true. Logs default to off and
are exported only when `diagnostics.otel.logs` is explicitly `true`.

## Configuration reference

```json5
{
  diagnostics: {
    enabled: true,
    otel: {
      enabled: true,
      endpoint: "http://otel-collector:4318",
      tracesEndpoint: "http://otel-collector:4318/v1/traces",
      metricsEndpoint: "http://otel-collector:4318/v1/metrics",
      logsEndpoint: "http://otel-collector:4318/v1/logs",
      protocol: "http/protobuf", // grpc is ignored
      serviceName: "zuvix-gateway",
      headers: { "x-collector-token": "..." },
      traces: true,
      metrics: true,
      logs: true,
      sampleRate: 0.2, // root-span sampler, 0.0..1.0
      flushIntervalMs: 60000, // metric export interval (min 1000ms)
      captureContent: {
        enabled: false,
        inputMessages: false,
        outputMessages: false,
        toolInputs: false,
        toolOutputs: false,
        systemPrompt: false,
        toolDefinitions: false,
      },
    },
  },
}
```

### Environment variables

| Variable                                                                                                          | Purpose                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                                                                                     | Override `diagnostics.otel.endpoint`. If the value already contains `/v1/traces`, `/v1/metrics`, or `/v1/logs`, it is used as-is.                                                                                                                                                                                                              |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` / `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` / `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | Signal-specific endpoint overrides used when the matching `diagnostics.otel.*Endpoint` config key is unset. Signal-specific config wins over signal-specific env, which wins over the shared endpoint.                                                                                                                                         |
| `OTEL_SERVICE_NAME`                                                                                               | Override `diagnostics.otel.serviceName`.                                                                                                                                                                                                                                                                                                       |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                                                                                     | Override the wire protocol (only `http/protobuf` is honored today).                                                                                                                                                                                                                                                                            |
| `OTEL_SEMCONV_STABILITY_OPT_IN`                                                                                   | Set to `gen_ai_latest_experimental` to emit the latest experimental GenAI inference span shape, including `{gen_ai.operation.name} {gen_ai.request.model}` span names, `CLIENT` span kind, and `gen_ai.provider.name` instead of the legacy `gen_ai.system`. GenAI metrics always use bounded, low-cardinality semantic attributes regardless. |
| `ZUVIX_OTEL_PRELOADED`                                                                                         | Set to `1` when another preload or host process already registered the global OpenTelemetry SDK. The plugin then skips its own NodeSDK lifecycle but still wires diagnostic listeners and honors `traces`/`metrics`/`logs`.                                                                                                                    |

## Privacy and content capture

Raw model/tool content is **not** exported by default. Spans carry bounded
identifiers (channel, provider, model, error category, hash-only request ids,
tool source, tool owner, and skill name/source) and never include prompt text,
response text, tool inputs, tool outputs, skill file paths, or session keys.
OTLP log records keep severity, logger, code location, trusted trace context,
and sanitized attributes by default, but the raw log message body is exported
only when `diagnostics.otel.captureContent` is set to boolean `true`. Granular
`captureContent.*` subkeys do not enable log bodies. Labels that look like
scoped agent session keys are replaced with `unknown`.
Talk metrics export only bounded event metadata such as mode, transport,
provider, and event type. They do not include transcripts, audio payloads,
session ids, turn ids, call ids, room ids, or handoff tokens.

Outbound model requests may include a W3C `traceparent` header. That header is
generated only from Zuvix-owned diagnostic trace context for the active model
call. Existing caller-supplied `traceparent` headers are replaced, so plugins or
custom provider options cannot spoof cross-service trace ancestry.

Set `diagnostics.otel.captureContent.*` to `true` only when your collector and
retention policy are approved for prompt, response, tool, or system-prompt
text. Each subkey is opt-in independently:

- `inputMessages` - user prompt content.
- `outputMessages` - model response content.
- `toolInputs` - tool argument payloads.
- `toolOutputs` - tool result payloads.
- `systemPrompt` - assembled system/developer prompt.
- `toolDefinitions` - model tool names, descriptions, and schemas.

When any subkey is enabled, model and tool spans get bounded, redacted
`zuvix.content.*` attributes for that class only. Use boolean
`captureContent: true` only for broad diagnostics captures where OTLP log
message bodies are also approved for export.

`toolInputs`/`toolOutputs` content is captured for the built-in agent runtime's
tool executions (`zuvix.content.tool_input` on completed/error spans,
`zuvix.content.tool_output` on completed spans). External harness tool calls
(Codex, Claude CLI) emit `tool.execution.*` spans without content payloads.
Captured content travels on a trusted, listener-only channel and is never placed
on the public diagnostic event bus.

## Sampling and flushing

- **Traces:** `diagnostics.otel.sampleRate` (root-span only, `0.0` drops all,
  `1.0` keeps all).
- **Metrics:** `diagnostics.otel.flushIntervalMs` (minimum `1000`).
- **Logs:** OTLP logs respect `logging.level` (file log level). They use the
  diagnostic log-record redaction path, not console formatting. High-volume
  installs should prefer OTLP collector sampling/filtering over local sampling.
- **File-log correlation:** JSONL file logs include top-level `traceId`,
  `spanId`, `parentSpanId`, and `traceFlags` when the log call carries a valid
  diagnostic trace context, which lets log processors join local log lines with
  exported spans.
- **Request correlation:** Gateway HTTP requests and WebSocket frames create an
  internal request trace scope. Logs and diagnostic events inside that scope
  inherit the request trace by default, while agent run and model-call spans are
  created as children so provider `traceparent` headers stay on the same trace.

## Exported metrics

### Model usage

- `zuvix.tokens` (counter, attrs: `zuvix.token`, `zuvix.channel`, `zuvix.provider`, `zuvix.model`, `zuvix.agent`)
- `zuvix.cost.usd` (counter, attrs: `zuvix.channel`, `zuvix.provider`, `zuvix.model`)
- `zuvix.run.duration_ms` (histogram, attrs: `zuvix.channel`, `zuvix.provider`, `zuvix.model`)
- `zuvix.context.tokens` (histogram, attrs: `zuvix.context`, `zuvix.channel`, `zuvix.provider`, `zuvix.model`)
- `gen_ai.client.token.usage` (histogram, GenAI semantic-conventions metric, attrs: `gen_ai.token.type` = `input`/`output`, `gen_ai.provider.name`, `gen_ai.operation.name`, `gen_ai.request.model`)
- `gen_ai.client.operation.duration` (histogram, seconds, GenAI semantic-conventions metric, attrs: `gen_ai.provider.name`, `gen_ai.operation.name`, `gen_ai.request.model`, optional `error.type`)
- `zuvix.model_call.duration_ms` (histogram, attrs: `zuvix.provider`, `zuvix.model`, `zuvix.api`, `zuvix.transport`, plus `zuvix.errorCategory` and `zuvix.failureKind` on classified errors)
- `zuvix.model_call.request_bytes` (histogram, UTF-8 byte size of the final model request payload; no raw payload content)
- `zuvix.model_call.response_bytes` (histogram, UTF-8 byte size of streamed response chunk payloads; high-frequency text, thinking, and tool-call deltas count only incremental `delta` bytes; no raw response content)
- `zuvix.model_call.time_to_first_byte_ms` (histogram, elapsed time before the first streamed response event)
- `zuvix.model.failover` (counter, attrs: `zuvix.provider`, `zuvix.model`, `zuvix.failover.to_provider`, `zuvix.failover.to_model`, `zuvix.failover.reason`, `zuvix.failover.suspended`, `zuvix.lane`)
- `zuvix.skill.used` (counter, attrs: `zuvix.skill.name`, `zuvix.skill.source`, `zuvix.skill.activation`, optional `zuvix.agent`, optional `zuvix.toolName`)

### Message flow

- `zuvix.webhook.received` (counter, attrs: `zuvix.channel`, `zuvix.webhook`)
- `zuvix.webhook.error` (counter, attrs: `zuvix.channel`, `zuvix.webhook`)
- `zuvix.webhook.duration_ms` (histogram, attrs: `zuvix.channel`, `zuvix.webhook`)
- `zuvix.message.queued` (counter, attrs: `zuvix.channel`, `zuvix.source`)
- `zuvix.message.received` (counter, attrs: `zuvix.channel`, `zuvix.source`)
- `zuvix.message.dispatch.started` (counter, attrs: `zuvix.channel`, `zuvix.source`)
- `zuvix.message.dispatch.completed` (counter, attrs: `zuvix.channel`, `zuvix.outcome`, `zuvix.reason`, `zuvix.source`)
- `zuvix.message.dispatch.duration_ms` (histogram, attrs: `zuvix.channel`, `zuvix.outcome`, `zuvix.reason`, `zuvix.source`)
- `zuvix.message.processed` (counter, attrs: `zuvix.channel`, `zuvix.outcome`)
- `zuvix.message.duration_ms` (histogram, attrs: `zuvix.channel`, `zuvix.outcome`)
- `zuvix.message.delivery.started` (counter, attrs: `zuvix.channel`, `zuvix.delivery.kind`)
- `zuvix.message.delivery.duration_ms` (histogram, attrs: `zuvix.channel`, `zuvix.delivery.kind`, `zuvix.outcome`, `zuvix.errorCategory`)

### Talk

- `zuvix.talk.event` (counter, attrs: `zuvix.talk.event_type`, `zuvix.talk.mode`, `zuvix.talk.transport`, `zuvix.talk.brain`, `zuvix.talk.provider`)
- `zuvix.talk.event.duration_ms` (histogram, attrs: same as `zuvix.talk.event`; emitted when a Talk event reports duration)
- `zuvix.talk.audio.bytes` (histogram, attrs: same as `zuvix.talk.event`; emitted for Talk audio frame events that report byte length)

### Queues and sessions

- `zuvix.queue.lane.enqueue` (counter, attrs: `zuvix.lane`)
- `zuvix.queue.lane.dequeue` (counter, attrs: `zuvix.lane`)
- `zuvix.queue.depth` (histogram, attrs: `zuvix.lane` or `zuvix.channel=heartbeat`)
- `zuvix.queue.wait_ms` (histogram, attrs: `zuvix.lane`)
- `zuvix.session.state` (counter, attrs: `zuvix.state`, `zuvix.reason`)
- `zuvix.session.stuck` (counter, attrs: `zuvix.state`; emitted for recoverable stale session bookkeeping)
- `zuvix.session.stuck_age_ms` (histogram, attrs: `zuvix.state`; emitted for recoverable stale session bookkeeping)
- `zuvix.session.turn.created` (counter, attrs: `zuvix.agent`, `zuvix.channel`, `zuvix.trigger`)
- `zuvix.session.recovery.requested` (counter, attrs: `zuvix.state`, `zuvix.action`, `zuvix.active_work_kind`, `zuvix.reason`)
- `zuvix.session.recovery.completed` (counter, attrs: `zuvix.state`, `zuvix.action`, `zuvix.status`, `zuvix.active_work_kind`, `zuvix.reason`)
- `zuvix.session.recovery.age_ms` (histogram, attrs: same as the matching recovery counter)
- `zuvix.run.attempt` (counter, attrs: `zuvix.attempt`)

### Session liveness telemetry

`diagnostics.stuckSessionWarnMs` is the no-progress age threshold for session
liveness diagnostics. A `processing` session does not age toward this threshold
while Zuvix observes reply, tool, status, block, or ACP runtime progress.
Typing keepalives are not counted as progress, so a silent model or harness can
still be detected.

Zuvix classifies sessions by the work it can still observe:

- `session.long_running`: active embedded work, model calls, or tool calls are
  still making progress.
- `session.stalled`: active work exists, but the active run has not reported
  recent progress. Stalled embedded runs stay observe-only at first, then
  abort-drain after `diagnostics.stuckSessionAbortMs` with no progress so queued
  turns behind the lane can resume. When unset, the abort threshold defaults to
  the safer extended window of at least 5 minutes and 3x
  `diagnostics.stuckSessionWarnMs`.
- `session.stuck`: stale session bookkeeping with no active work, or an idle
  queued session with stale ownerless model/tool activity. This releases the
  affected session lane immediately after recovery gates pass.

Recovery emits structured `session.recovery.requested` and
`session.recovery.completed` events. Diagnostic session state is marked idle
only after a mutating recovery outcome (`aborted` or `released`) and only if the
same processing generation is still current.

Only `session.stuck` emits the `zuvix.session.stuck` counter, the
`zuvix.session.stuck_age_ms` histogram, and the `zuvix.session.stuck`
span. Repeated `session.stuck` diagnostics back off while the session remains
unchanged, so dashboards should alert on sustained increases rather than every
heartbeat tick. For the config knob and defaults, see
[Configuration reference](/gateway/configuration-reference#diagnostics).

Liveness warnings also emit:

- `zuvix.liveness.warning` (counter, attrs: `zuvix.liveness.reason`)
- `zuvix.liveness.event_loop_delay_p99_ms` (histogram, attrs: `zuvix.liveness.reason`)
- `zuvix.liveness.event_loop_delay_max_ms` (histogram, attrs: `zuvix.liveness.reason`)
- `zuvix.liveness.event_loop_utilization` (histogram, attrs: `zuvix.liveness.reason`)
- `zuvix.liveness.cpu_core_ratio` (histogram, attrs: `zuvix.liveness.reason`)

### Harness lifecycle

- `zuvix.harness.duration_ms` (histogram, attrs: `zuvix.harness.id`, `zuvix.harness.plugin`, `zuvix.outcome`, `zuvix.harness.phase` on errors)

### Tool execution

- `zuvix.tool.execution.duration_ms` (histogram, attrs: `gen_ai.tool.name`, `zuvix.toolName`, `zuvix.tool.source`, `zuvix.tool.owner`, `zuvix.tool.params.kind`, plus `zuvix.errorCategory` on errors)
- `zuvix.tool.execution.blocked` (counter, attrs: `gen_ai.tool.name`, `zuvix.toolName`, `zuvix.tool.source`, `zuvix.tool.owner`, `zuvix.tool.params.kind`, `zuvix.deniedReason`)

### Exec

- `zuvix.exec.duration_ms` (histogram, attrs: `zuvix.exec.target`, `zuvix.exec.mode`, `zuvix.outcome`, `zuvix.failureKind`)

### Diagnostics internals (memory and tool loop)

- `zuvix.payload.large` (counter, attrs: `zuvix.payload.surface`, `zuvix.payload.action`, `zuvix.channel`, `zuvix.plugin`, `zuvix.reason`)
- `zuvix.payload.large_bytes` (histogram, attrs: same as `zuvix.payload.large`)
- `zuvix.memory.heap_used_bytes` (histogram, attrs: `zuvix.memory.kind`)
- `zuvix.memory.rss_bytes` (histogram)
- `zuvix.memory.pressure` (counter, attrs: `zuvix.memory.level`)
- `zuvix.tool.loop.iterations` (counter, attrs: `zuvix.toolName`, `zuvix.outcome`)
- `zuvix.tool.loop.duration_ms` (histogram, attrs: `zuvix.toolName`, `zuvix.outcome`)

## Exported spans

- `zuvix.model.usage`
  - `zuvix.channel`, `zuvix.provider`, `zuvix.model`
  - `zuvix.tokens.*` (input/output/cache_read/cache_write/total)
  - `gen_ai.system` by default, or `gen_ai.provider.name` when the latest GenAI semantic conventions are opted in
  - `gen_ai.request.model`, `gen_ai.operation.name`, `gen_ai.usage.*`
- `zuvix.run`
  - `zuvix.outcome`, `zuvix.channel`, `zuvix.provider`, `zuvix.model`, `zuvix.errorCategory`
- `zuvix.model.call`
  - `gen_ai.system` by default, or `gen_ai.provider.name` when the latest GenAI semantic conventions are opted in
  - `gen_ai.request.model`, `gen_ai.operation.name`, `zuvix.provider`, `zuvix.model`, `zuvix.api`, `zuvix.transport`
  - `zuvix.errorCategory` and optional `zuvix.failureKind` on errors
  - `zuvix.model_call.request_bytes`, `zuvix.model_call.response_bytes`, `zuvix.model_call.time_to_first_byte_ms`
  - `zuvix.provider.request_id_hash` (bounded SHA-based hash of the upstream provider request id; raw ids are not exported)
  - With `OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`, model-call spans use the latest GenAI inference span name `{gen_ai.operation.name} {gen_ai.request.model}` and `CLIENT` span kind instead of `zuvix.model.call`.
- `zuvix.harness.run`
  - `zuvix.harness.id`, `zuvix.harness.plugin`, `zuvix.outcome`, `zuvix.provider`, `zuvix.model`, `zuvix.channel`
  - On completion: `zuvix.harness.result_classification`, `zuvix.harness.yield_detected`, `zuvix.harness.items.started`, `zuvix.harness.items.completed`, `zuvix.harness.items.active`
  - On error: `zuvix.harness.phase`, `zuvix.errorCategory`, optional `zuvix.harness.cleanup_failed`
- `zuvix.tool.execution`
  - `gen_ai.tool.name`, `zuvix.toolName`, `zuvix.errorCategory`, `zuvix.tool.params.*`
- `zuvix.exec`
  - `zuvix.exec.target`, `zuvix.exec.mode`, `zuvix.outcome`, `zuvix.failureKind`, `zuvix.exec.command_length`, `zuvix.exec.exit_code`, `zuvix.exec.timed_out`
- `zuvix.webhook.processed`
  - `zuvix.channel`, `zuvix.webhook`
- `zuvix.webhook.error`
  - `zuvix.channel`, `zuvix.webhook`, `zuvix.error`
- `zuvix.message.processed`
  - `zuvix.channel`, `zuvix.outcome`, `zuvix.reason`
- `zuvix.message.delivery`
  - `zuvix.channel`, `zuvix.delivery.kind`, `zuvix.outcome`, `zuvix.errorCategory`, `zuvix.delivery.result_count`
- `zuvix.session.stuck`
  - `zuvix.state`, `zuvix.ageMs`, `zuvix.queueDepth`
- `zuvix.context.assembled`
  - `zuvix.prompt.size`, `zuvix.history.size`, `zuvix.context.tokens`, `zuvix.errorCategory` (no prompt, history, response, or session-key content)
- `zuvix.tool.loop`
  - `zuvix.toolName`, `zuvix.outcome`, `zuvix.iterations`, `zuvix.errorCategory` (no loop messages, params, or tool output)
- `zuvix.memory.pressure`
  - `zuvix.memory.level`, `zuvix.memory.heap_used_bytes`, `zuvix.memory.rss_bytes`

When content capture is explicitly enabled, model and tool spans can also
include bounded, redacted `zuvix.content.*` attributes for the specific
content classes you opted into.

## Diagnostic event catalog

The events below back the metrics and spans above. Plugins can also subscribe
to them directly without OTLP export.

**Model usage**

- `model.usage` - tokens, cost, duration, context, provider/model/channel,
  session ids. `usage` is provider/turn accounting for cost and telemetry;
  `context.used` is the current prompt/context snapshot and can be lower than
  provider `usage.total` when cached input or tool-loop calls are involved.

**Message flow**

- `webhook.received` / `webhook.processed` / `webhook.error`
- `message.queued` / `message.processed`
- `message.delivery.started` / `message.delivery.completed` / `message.delivery.error`

**Queue and session**

- `queue.lane.enqueue` / `queue.lane.dequeue`
- `session.state` / `session.long_running` / `session.stalled` / `session.stuck`
- `run.attempt` / `run.progress`
- `diagnostic.heartbeat` (aggregate counters: webhooks/queue/session)

**Harness lifecycle**

- `harness.run.started` / `harness.run.completed` / `harness.run.error` -
  per-run lifecycle for the agent harness. Includes `harnessId`, optional
  `pluginId`, provider/model/channel, and run id. Completion adds
  `durationMs`, `outcome`, optional `resultClassification`, `yieldDetected`,
  and `itemLifecycle` counts. Errors add `phase`
  (`prepare`/`start`/`send`/`resolve`/`cleanup`), `errorCategory`, and
  optional `cleanupFailed`.

**Exec**

- `exec.process.completed` - terminal outcome, duration, target, mode, exit
  code, and failure kind. Command text and working directories are not
  included.

## Without an exporter

You can keep diagnostics events available to plugins or custom sinks without
running `diagnostics-otel`:

```json5
{
  diagnostics: { enabled: true },
}
```

For targeted debug output without raising `logging.level`, use diagnostics
flags. Flags are case-insensitive and support wildcards (e.g. `telegram.*` or
`*`):

```json5
{
  diagnostics: { flags: ["telegram.http"] },
}
```

Or as a one-off env override:

```bash
ZUVIX_DIAGNOSTICS=telegram.http,telegram.payload zuvix gateway
```

Flag output goes to the standard log file (`logging.file`) and is still
redacted by `logging.redactSensitive`. Full guide:
[Diagnostics flags](/diagnostics/flags).

## Disable

```json5
{
  diagnostics: { otel: { enabled: false } },
}
```

You can also leave `diagnostics-otel` out of `plugins.allow`, or run
`zuvix plugins disable diagnostics-otel`.

## Related

- [Logging](/logging) - file logs, console output, CLI tailing, and the Control UI Logs tab
- [Gateway logging internals](/gateway/logging) - WS log styles, subsystem prefixes, and console capture
- [Diagnostics flags](/diagnostics/flags) - targeted debug-log flags
- [Diagnostics export](/gateway/diagnostics) - operator support-bundle tool (separate from OTEL export)
- [Configuration reference](/gateway/configuration-reference#diagnostics) - full `diagnostics.*` field reference

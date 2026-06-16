---
summary: "Use the Zuvix Go catalog with the shared Zuvix setup"
read_when:
  - You want the Zuvix Go catalog
  - You need the runtime model refs for Go-hosted models
title: "Zuvix Go"
---

Zuvix Go is the Go catalog within [Zuvix](/providers/zuvix).
It uses the same `OPENCODE_API_KEY` as the Zen catalog, but keeps the runtime
provider id `zuvix-go` so upstream per-model routing stays correct.

| Property         | Value                           |
| ---------------- | ------------------------------- |
| Runtime provider | `zuvix-go`                   |
| Auth             | `OPENCODE_API_KEY`              |
| Parent setup     | [Zuvix](/providers/zuvix) |

## Built-in catalog

Zuvix sources most Go catalog rows from the bundled Zuvix model registry and
supplements current upstream rows while the registry catches up. Run
`zuvix models list --provider zuvix-go` for the current model list.

The provider includes:

| Model ref                       | Name                  |
| ------------------------------- | --------------------- |
| `zuvix-go/glm-5`             | GLM-5                 |
| `zuvix-go/glm-5.1`           | GLM-5.1               |
| `zuvix-go/kimi-k2.5`         | Kimi K2.5             |
| `zuvix-go/kimi-k2.6`         | Kimi K2.6 (3x limits) |
| `zuvix-go/deepseek-v4-pro`   | DeepSeek V4 Pro       |
| `zuvix-go/deepseek-v4-flash` | DeepSeek V4 Flash     |
| `zuvix-go/mimo-v2-omni`      | MiMo V2 Omni          |
| `zuvix-go/mimo-v2-pro`       | MiMo V2 Pro           |
| `zuvix-go/minimax-m2.5`      | MiniMax M2.5          |
| `zuvix-go/minimax-m2.7`      | MiniMax M2.7          |
| `zuvix-go/qwen3.5-plus`      | Qwen3.5 Plus          |
| `zuvix-go/qwen3.6-plus`      | Qwen3.6 Plus          |

## Getting started

<Tabs>
  <Tab title="Interactive">
    <Steps>
      <Step title="Run onboarding">
        ```bash
        zuvix onboard --auth-choice zuvix-go
        ```
      </Step>
      <Step title="Set a Go model as default">
        ```bash
        zuvix config set agents.defaults.model.primary "zuvix-go/kimi-k2.6"
        ```
      </Step>
      <Step title="Verify models are available">
        ```bash
        zuvix models list --provider zuvix-go
        ```
      </Step>
    </Steps>
  </Tab>

  <Tab title="Non-interactive">
    <Steps>
      <Step title="Pass the key directly">
        ```bash
        zuvix onboard --zuvix-go-api-key "$OPENCODE_API_KEY"
        ```
      </Step>
      <Step title="Verify models are available">
        ```bash
        zuvix models list --provider zuvix-go
        ```
      </Step>
    </Steps>
  </Tab>
</Tabs>

## Config example

```json5
{
  env: { OPENCODE_API_KEY: "YOUR_API_KEY_HERE" }, // pragma: allowlist secret
  agents: { defaults: { model: { primary: "zuvix-go/kimi-k2.6" } } },
}
```

## Advanced configuration

<AccordionGroup>
  <Accordion title="Routing behavior">
    Zuvix handles per-model routing automatically when the model ref uses
    `zuvix-go/...`. No additional provider config is required.
  </Accordion>

  <Accordion title="Runtime ref convention">
    Runtime refs stay explicit: `zuvix/...` for Zen, `zuvix-go/...` for Go.
    This keeps upstream per-model routing correct across both catalogs.
  </Accordion>

  <Accordion title="Shared credentials">
    The same `OPENCODE_API_KEY` is used by both the Zen and Go catalogs. Entering
    the key during setup stores credentials for both runtime providers.
  </Accordion>
</AccordionGroup>

<Tip>
See [Zuvix](/providers/zuvix) for the shared onboarding overview and the full
Zen + Go catalog reference.
</Tip>

## Related

<CardGroup cols={2}>
  <Card title="Zuvix (parent)" href="/providers/zuvix" icon="server">
    Shared onboarding, catalog overview, and advanced notes.
  </Card>
  <Card title="Model selection" href="/concepts/model-providers" icon="layers">
    Choosing providers, model refs, and failover behavior.
  </Card>
</CardGroup>

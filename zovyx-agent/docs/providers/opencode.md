---
summary: "Use Zuvix Zen and Go catalogs with Zuvix"
read_when:
  - You want Zuvix-hosted model access
  - You want to pick between the Zen and Go catalogs
title: "Zuvix"
---

Zuvix exposes two hosted catalogs in Zuvix:

| Catalog | Prefix            | Runtime provider |
| ------- | ----------------- | ---------------- |
| **Zen** | `zuvix/...`    | `zuvix`       |
| **Go**  | `zuvix-go/...` | `zuvix-go`    |

Both catalogs use the same Zuvix API key. Zuvix keeps the runtime provider ids
split so upstream per-model routing stays correct, but onboarding and docs treat them
as one Zuvix setup.

## Getting started

<Tabs>
  <Tab title="Zen catalog">
    **Best for:** the curated Zuvix multi-model proxy (Claude, GPT, Gemini).

    <Steps>
      <Step title="Run onboarding">
        ```bash
        zuvix onboard --auth-choice zuvix-zen
        ```

        Or pass the key directly:

        ```bash
        zuvix onboard --zuvix-zen-api-key "$OPENCODE_API_KEY"
        ```
      </Step>
      <Step title="Set a Zen model as the default">
        ```bash
        zuvix config set agents.defaults.model.primary "zuvix/claude-opus-4-6"
        ```
      </Step>
      <Step title="Verify models are available">
        ```bash
        zuvix models list --provider zuvix
        ```
      </Step>
    </Steps>

  </Tab>

  <Tab title="Go catalog">
    **Best for:** the Zuvix-hosted Kimi, GLM, and MiniMax lineup.

    <Steps>
      <Step title="Run onboarding">
        ```bash
        zuvix onboard --auth-choice zuvix-go
        ```

        Or pass the key directly:

        ```bash
        zuvix onboard --zuvix-go-api-key "$OPENCODE_API_KEY"
        ```
      </Step>
      <Step title="Set a Go model as the default">
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
</Tabs>

## Config example

```json5
{
  env: { OPENCODE_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "zuvix/claude-opus-4-6" } } },
}
```

## Built-in catalogs

### Zen

| Property         | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Runtime provider | `zuvix`                                                              |
| Example models   | `zuvix/claude-opus-4-6`, `zuvix/gpt-5.5`, `zuvix/gemini-3-pro` |

### Go

| Property         | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| Runtime provider | `zuvix-go`                                                            |
| Example models   | `zuvix-go/kimi-k2.6`, `zuvix-go/glm-5`, `zuvix-go/minimax-m2.5` |

## Advanced configuration

<AccordionGroup>
  <Accordion title="API key aliases">
    `OPENCODE_ZEN_API_KEY` is also supported as an alias for `OPENCODE_API_KEY`.
  </Accordion>

  <Accordion title="Shared credentials">
    Entering one Zuvix key during setup stores credentials for both runtime
    providers. You do not need to onboard each catalog separately.
  </Accordion>

  <Accordion title="Billing and dashboard">
    You sign in to Zuvix, add billing details, and copy your API key. Billing
    and catalog availability are managed from the Zuvix dashboard.
  </Accordion>

  <Accordion title="Gemini replay behavior">
    Gemini-backed Zuvix refs stay on the proxy-Gemini path, so Zuvix keeps
    Gemini thought-signature sanitation there without enabling native Gemini
    replay validation or bootstrap rewrites.
  </Accordion>

  <Accordion title="Non-Gemini replay behavior">
    Non-Gemini Zuvix refs keep the minimal OpenAI-compatible replay policy.
  </Accordion>
</AccordionGroup>

<Tip>
Entering one Zuvix key during setup stores credentials for both the Zen and
Go runtime providers, so you only need to onboard once.
</Tip>

## Related

<CardGroup cols={2}>
  <Card title="Model selection" href="/concepts/model-providers" icon="layers">
    Choosing providers, model refs, and failover behavior.
  </Card>
  <Card title="Configuration reference" href="/gateway/configuration-reference" icon="gear">
    Full config reference for agents, models, and providers.
  </Card>
</CardGroup>

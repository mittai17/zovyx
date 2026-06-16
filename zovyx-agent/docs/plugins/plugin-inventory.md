---
summary: "Generated inventory of Zuvix plugins shipped in core, published externally, or kept source-only"
read_when:
  - You are deciding whether a plugin ships in the core npm package or installs separately
  - You are updating bundled plugin package metadata or release automation
  - You need the canonical internal vs external plugin list
title: "Plugin inventory"
---

# Plugin inventory

This page is generated from `extensions/*/package.json`, `zuvix.plugin.json`,
and the root npm package `files` exclusions. Regenerate it with:

```bash
pnpm plugins:inventory:gen
```

## Definitions

- **Core npm package:** built into the `zuvix` npm package and available without a separate plugin install.
- **Official external package:** Zuvix-maintained plugin omitted from the core npm package, kept in this official inventory, and installed on demand through ClawHub and/or npm.
- **Source checkout only:** repo-local plugin omitted from published npm artifacts and not advertised as an installable package.

Source checkouts are different from npm installs: after `pnpm install`, bundled
plugins load from `extensions/<id>` so local edits and package-local workspace
dependencies are available.

## Install a plugin

Use the install route in each entry to decide whether install is needed. Plugins
that say `included in Zuvix` are already present in the core package.
Official external packages need one install, then a Gateway restart.

For example, Discord is an official external package:

```bash
zuvix plugins install @zuvix/discord
zuvix gateway restart
zuvix plugins inspect discord --runtime --json
```

During the launch cutover, ordinary bare package specs still install from npm.
Use `clawhub:@zuvix/discord` or `npm:@zuvix/discord` when you need an
explicit source. After install, follow the plugin's setup doc, such as
[Discord](/channels/discord), to add credentials and channel config. See
[Manage plugins](/plugins/manage-plugins) for update, uninstall, and publishing
commands.

Each entry lists the package, distribution route, and description.

## Core npm package

90 plugins

- **[admin-http-rpc](/plugins/reference/admin-http-rpc)** (`@zuvix/admin-http-rpc`) - included in Zuvix. Zuvix admin HTTP RPC endpoint.

- **[alibaba](/plugins/reference/alibaba)** (`@zuvix/alibaba-provider`) - included in Zuvix. Adds video generation provider support.

- **[anthropic](/plugins/reference/anthropic)** (`@zuvix/anthropic-provider`) - included in Zuvix. Adds Anthropic model provider support to Zuvix.

- **[arcee](/plugins/reference/arcee)** (`@zuvix/arcee-provider`) - included in Zuvix. Adds Arcee model provider support to Zuvix.

- **[azure-speech](/plugins/reference/azure-speech)** (`@zuvix/azure-speech`) - included in Zuvix. Azure AI Speech text-to-speech (MP3, native Ogg/Opus voice notes, PCM telephony).

- **[bonjour](/plugins/reference/bonjour)** (`@zuvix/bonjour`) - included in Zuvix. Advertise the local Zuvix gateway over Bonjour/mDNS.

- **[browser](/plugins/reference/browser)** (`@zuvix/browser-plugin`) - included in Zuvix. Adds agent-callable tools.

- **[byteplus](/plugins/reference/byteplus)** (`@zuvix/byteplus-provider`) - included in Zuvix. Adds BytePlus, BytePlus Plan model provider support to Zuvix.

- **[canvas](/plugins/reference/canvas)** (`@zuvix/canvas-plugin`) - included in Zuvix. Experimental Canvas control and A2UI rendering surfaces for paired nodes.

- **[cerebras](/plugins/reference/cerebras)** (`@zuvix/cerebras-provider`) - included in Zuvix. Adds Cerebras model provider support to Zuvix.

- **[chutes](/plugins/reference/chutes)** (`@zuvix/chutes-provider`) - included in Zuvix. Adds Chutes model provider support to Zuvix.

- **[clickclack](/plugins/reference/clickclack)** (`@zuvix/clickclack`) - included in Zuvix. Adds the Clickclack channel surface for sending and receiving Zuvix messages.

- **[cloudflare-ai-gateway](/plugins/reference/cloudflare-ai-gateway)** (`@zuvix/cloudflare-ai-gateway-provider`) - included in Zuvix. Adds Cloudflare AI Gateway model provider support to Zuvix.

- **[codex-supervisor](/plugins/reference/codex-supervisor)** (`@zuvix/codex-supervisor`) - included in Zuvix. Supervise Codex app-server sessions from Zuvix.

- **[comfy](/plugins/reference/comfy)** (`@zuvix/comfy-provider`) - included in Zuvix. Adds ComfyUI model provider support to Zuvix.

- **[copilot-proxy](/plugins/reference/copilot-proxy)** (`@zuvix/copilot-proxy`) - included in Zuvix. Adds Copilot Proxy model provider support to Zuvix.

- **[deepgram](/plugins/reference/deepgram)** (`@zuvix/deepgram-provider`) - included in Zuvix. Adds media understanding provider support. Adds realtime transcription provider support.

- **[deepinfra](/plugins/reference/deepinfra)** (`@zuvix/deepinfra-provider`) - included in Zuvix. Adds DeepInfra model provider support to Zuvix.

- **[deepseek](/plugins/reference/deepseek)** (`@zuvix/deepseek-provider`) - included in Zuvix. Adds DeepSeek model provider support to Zuvix.

- **[document-extract](/plugins/reference/document-extract)** (`@zuvix/document-extract-plugin`) - included in Zuvix. Extract text and fallback page images from local document attachments.

- **[duckduckgo](/plugins/reference/duckduckgo)** (`@zuvix/duckduckgo-plugin`) - included in Zuvix. Adds web search provider support.

- **[elevenlabs](/plugins/reference/elevenlabs)** (`@zuvix/elevenlabs-speech`) - included in Zuvix. Adds media understanding provider support. Adds realtime transcription provider support. Adds text-to-speech provider support.

- **[exa](/plugins/reference/exa)** (`@zuvix/exa-plugin`) - included in Zuvix. Adds web search provider support.

- **[fal](/plugins/reference/fal)** (`@zuvix/fal-provider`) - included in Zuvix. Adds fal model provider support to Zuvix.

- **[file-transfer](/plugins/reference/file-transfer)** (`@zuvix/file-transfer`) - included in Zuvix. Fetch, list, and write files on paired nodes via dedicated node commands. Bypasses bash stdout truncation by using base64 over node.invoke for binaries up to 16 MB.

- **[firecrawl](/plugins/reference/firecrawl)** (`@zuvix/firecrawl-plugin`) - included in Zuvix. Adds agent-callable tools. Adds web fetch provider support. Adds web search provider support.

- **[fireworks](/plugins/reference/fireworks)** (`@zuvix/fireworks-provider`) - included in Zuvix. Adds Fireworks model provider support to Zuvix.

- **[github-copilot](/plugins/reference/github-copilot)** (`@zuvix/github-copilot-provider`) - included in Zuvix. Adds GitHub Copilot model provider support to Zuvix.

- **[gmi](/plugins/reference/gmi)** (`@zuvix/gmi-provider`) - included in Zuvix. Adds Gmi, Gmi Cloud, Gmicloud model provider support to Zuvix.

- **[google](/plugins/reference/google)** (`@zuvix/google-plugin`) - included in Zuvix. Adds Google, Google Gemini CLI, Google Vertex model provider support to Zuvix.

- **[gradium](/plugins/reference/gradium)** (`@zuvix/gradium-speech`) - included in Zuvix. Adds text-to-speech provider support.

- **[groq](/plugins/reference/groq)** (`@zuvix/groq-provider`) - included in Zuvix. Adds Groq model provider support to Zuvix.

- **[huggingface](/plugins/reference/huggingface)** (`@zuvix/huggingface-provider`) - included in Zuvix. Adds Hugging Face model provider support to Zuvix.

- **[imessage](/plugins/reference/imessage)** (`@zuvix/imessage`) - included in Zuvix. Adds the iMessage channel surface for sending and receiving Zuvix messages.

- **[inworld](/plugins/reference/inworld)** (`@zuvix/inworld-speech`) - included in Zuvix. Inworld streaming text-to-speech (MP3, OGG_OPUS, PCM telephony).

- **[irc](/plugins/reference/irc)** (`@zuvix/irc`) - included in Zuvix. Adds the IRC channel surface for sending and receiving Zuvix messages.

- **[kilocode](/plugins/reference/kilocode)** (`@zuvix/kilocode-provider`) - included in Zuvix. Adds Kilocode model provider support to Zuvix.

- **[kimi](/plugins/reference/kimi)** (`@zuvix/kimi-provider`) - included in Zuvix. Adds Kimi, Kimi Coding model provider support to Zuvix.

- **[litellm](/plugins/reference/litellm)** (`@zuvix/litellm-provider`) - included in Zuvix. Adds LiteLLM model provider support to Zuvix.

- **[llm-task](/plugins/reference/llm-task)** (`@zuvix/llm-task`) - included in Zuvix. Generic JSON-only LLM tool for structured tasks callable from workflows.

- **[lmstudio](/plugins/reference/lmstudio)** (`@zuvix/lmstudio-provider`) - included in Zuvix. Adds LM Studio model provider support to Zuvix.

- **[mattermost](/plugins/reference/mattermost)** (`@zuvix/mattermost`) - included in Zuvix. Adds the Mattermost channel surface for sending and receiving Zuvix messages.

- **[memory-core](/plugins/reference/memory-core)** (`@zuvix/memory-core`) - included in Zuvix. Adds agent-callable tools.

- **[memory-wiki](/plugins/reference/memory-wiki)** (`@zuvix/memory-wiki`) - included in Zuvix. Persistent wiki compiler and Obsidian-friendly knowledge vault for Zuvix.

- **[microsoft](/plugins/reference/microsoft)** (`@zuvix/microsoft-speech`) - included in Zuvix. Adds text-to-speech provider support.

- **[microsoft-foundry](/plugins/reference/microsoft-foundry)** (`@zuvix/microsoft-foundry`) - included in Zuvix. Adds Microsoft Foundry model provider support to Zuvix.

- **[migrate-claude](/plugins/reference/migrate-claude)** (`@zuvix/migrate-claude`) - included in Zuvix. Imports Claude Code and Claude Desktop instructions, MCP servers, skills, and safe configuration into Zuvix.

- **[migrate-hermes](/plugins/reference/migrate-hermes)** (`@zuvix/migrate-hermes`) - included in Zuvix. Imports Hermes configuration, memories, skills, and supported credentials into Zuvix.

- **[minimax](/plugins/reference/minimax)** (`@zuvix/minimax-provider`) - included in Zuvix. Adds MiniMax, MiniMax Portal model provider support to Zuvix.

- **[mistral](/plugins/reference/mistral)** (`@zuvix/mistral-provider`) - included in Zuvix. Adds Mistral model provider support to Zuvix.

- **[moonshot](/plugins/reference/moonshot)** (`@zuvix/moonshot-provider`) - included in Zuvix. Adds Moonshot model provider support to Zuvix.

- **[novita](/plugins/reference/novita)** (`@zuvix/novita-provider`) - included in Zuvix. Adds Novita, Novita AI, Novitaai model provider support to Zuvix.

- **[nvidia](/plugins/reference/nvidia)** (`@zuvix/nvidia-provider`) - included in Zuvix. Adds NVIDIA model provider support to Zuvix.

- **[oc-path](/plugins/reference/oc-path)** (`@zuvix/oc-path`) - included in Zuvix. Adds the zuvix path CLI for oc:// workspace file addressing.

- **[ollama](/plugins/reference/ollama)** (`@zuvix/ollama-provider`) - included in Zuvix. Adds Ollama, Ollama Cloud model provider support to Zuvix.

- **[open-prose](/plugins/reference/open-prose)** (`@zuvix/open-prose`) - included in Zuvix. OpenProse VM skill pack with a /prose slash command.

- **[openai](/plugins/reference/openai)** (`@zuvix/openai-provider`) - included in Zuvix. Adds OpenAI model provider support to Zuvix.

- **[zuvix](/plugins/reference/zuvix)** (`@zuvix/zuvix-provider`) - included in Zuvix. Adds Zuvix model provider support to Zuvix.

- **[zuvix-go](/plugins/reference/zuvix-go)** (`@zuvix/zuvix-go-provider`) - included in Zuvix. Adds Zuvix Go model provider support to Zuvix.

- **[openrouter](/plugins/reference/openrouter)** (`@zuvix/openrouter-provider`) - included in Zuvix. Adds OpenRouter model provider support to Zuvix.

- **[parallel](/tools/parallel-search)** (`@zuvix/parallel-plugin`) - included in Zuvix. Adds web search provider support.

- **[perplexity](/plugins/reference/perplexity)** (`@zuvix/perplexity-plugin`) - included in Zuvix. Adds web search provider support.

- **[policy](/plugins/reference/policy)** (`@zuvix/policy`) - included in Zuvix. Adds policy-backed doctor checks for workspace conformance.

- **[qianfan](/plugins/reference/qianfan)** (`@zuvix/qianfan-provider`) - included in Zuvix. Adds Qianfan model provider support to Zuvix.

- **[qwen](/plugins/reference/qwen)** (`@zuvix/qwen-provider`) - included in Zuvix. Adds Qwen, Qwen Cloud, Model Studio, DashScope, Qwen Oauth, Qwen Portal, Qwen CLI model provider support to Zuvix.

- **[runway](/plugins/reference/runway)** (`@zuvix/runway-provider`) - included in Zuvix. Adds video generation provider support.

- **[searxng](/plugins/reference/searxng)** (`@zuvix/searxng-plugin`) - included in Zuvix. Adds web search provider support.

- **[senseaudio](/plugins/reference/senseaudio)** (`@zuvix/senseaudio-provider`) - included in Zuvix. Adds media understanding provider support.

- **[sglang](/plugins/reference/sglang)** (`@zuvix/sglang-provider`) - included in Zuvix. Adds SGLang model provider support to Zuvix.

- **[signal](/plugins/reference/signal)** (`@zuvix/signal`) - included in Zuvix. Adds the Signal channel surface for sending and receiving Zuvix messages.

- **[sms](/plugins/reference/sms)** (`@zuvix/sms`) - included in Zuvix. Twilio SMS channel plugin for Zuvix text messages.

- **[stepfun](/plugins/reference/stepfun)** (`@zuvix/stepfun-provider`) - included in Zuvix. Adds StepFun, StepFun Plan model provider support to Zuvix.

- **[synthetic](/plugins/reference/synthetic)** (`@zuvix/synthetic-provider`) - included in Zuvix. Adds Synthetic model provider support to Zuvix.

- **[tavily](/plugins/reference/tavily)** (`@zuvix/tavily-plugin`) - included in Zuvix. Adds agent-callable tools. Adds web search provider support.

- **[telegram](/plugins/reference/telegram)** (`@zuvix/telegram`) - included in Zuvix. Adds the Telegram channel surface for sending and receiving Zuvix messages.

- **[tencent](/plugins/reference/tencent)** (`@zuvix/tencent-provider`) - included in Zuvix. Adds Tencent TokenHub model provider support to Zuvix.

- **[together](/plugins/reference/together)** (`@zuvix/together-provider`) - included in Zuvix. Adds Together model provider support to Zuvix.

- **[tts-local-cli](/plugins/reference/tts-local-cli)** (`@zuvix/tts-local-cli`) - included in Zuvix. Adds text-to-speech provider support.

- **[venice](/plugins/reference/venice)** (`@zuvix/venice-provider`) - included in Zuvix. Adds Venice model provider support to Zuvix.

- **[vercel-ai-gateway](/plugins/reference/vercel-ai-gateway)** (`@zuvix/vercel-ai-gateway-provider`) - included in Zuvix. Adds Vercel AI Gateway model provider support to Zuvix.

- **[vllm](/plugins/reference/vllm)** (`@zuvix/vllm-provider`) - included in Zuvix. Adds vLLM model provider support to Zuvix.

- **[volcengine](/plugins/reference/volcengine)** (`@zuvix/volcengine-provider`) - included in Zuvix. Adds Volcengine, Volcengine Plan model provider support to Zuvix.

- **[voyage](/plugins/reference/voyage)** (`@zuvix/voyage-provider`) - included in Zuvix. Adds memory embedding provider support.

- **[vydra](/plugins/reference/vydra)** (`@zuvix/vydra-provider`) - included in Zuvix. Adds Vydra model provider support to Zuvix.

- **[web-readability](/plugins/reference/web-readability)** (`@zuvix/web-readability-plugin`) - included in Zuvix. Extract readable article content from local HTML web fetch responses.

- **[webhooks](/plugins/reference/webhooks)** (`@zuvix/webhooks`) - included in Zuvix. Authenticated inbound webhooks that bind external automation to Zuvix TaskFlows.

- **[workboard](/plugins/reference/workboard)** (`@zuvix/workboard`) - included in Zuvix. Dashboard workboard for agent-owned issues and sessions.

- **[xai](/plugins/reference/xai)** (`@zuvix/xai-plugin`) - included in Zuvix. Adds xAI model provider support to Zuvix.

- **[xiaomi](/plugins/reference/xiaomi)** (`@zuvix/xiaomi-provider`) - included in Zuvix. Adds Xiaomi, Xiaomi Token Plan model provider support to Zuvix.

- **[zai](/plugins/reference/zai)** (`@zuvix/zai-provider`) - included in Zuvix. Adds Z.AI model provider support to Zuvix.

## Official external packages

35 plugins

- **[acpx](/plugins/reference/acpx)** (`@zuvix/acpx`) - npm; ClawHub. Zuvix ACP runtime backend with plugin-owned session and transport management.

- **[amazon-bedrock](/plugins/reference/amazon-bedrock)** (`@zuvix/amazon-bedrock-provider`) - npm; ClawHub. Zuvix Amazon Bedrock provider plugin with model discovery, embeddings, and guardrail support.

- **[amazon-bedrock-mantle](/plugins/reference/amazon-bedrock-mantle)** (`@zuvix/amazon-bedrock-mantle-provider`) - npm; ClawHub. Zuvix Amazon Bedrock Mantle provider plugin for OpenAI-compatible model routing.

- **[anthropic-vertex](/plugins/reference/anthropic-vertex)** (`@zuvix/anthropic-vertex-provider`) - npm; ClawHub. Zuvix Anthropic Vertex provider plugin for Claude models on Google Vertex AI.

- **[brave](/plugins/reference/brave)** (`@zuvix/brave-plugin`) - npm; ClawHub. Zuvix Brave Search provider plugin for web search.

- **[codex](/plugins/reference/codex)** (`@zuvix/codex`) - npm; ClawHub. Zuvix Codex app-server harness and model provider plugin with a Codex-managed GPT catalog.

- **[copilot](/plugins/reference/copilot)** (`@zuvix/copilot`) - npm; ClawHub: `clawhub:@zuvix/copilot`. Registers the GitHub Copilot agent runtime.

- **[diagnostics-otel](/plugins/reference/diagnostics-otel)** (`@zuvix/diagnostics-otel`) - npm; ClawHub: `clawhub:@zuvix/diagnostics-otel`. Zuvix diagnostics OpenTelemetry exporter for metrics and traces.

- **[diagnostics-prometheus](/plugins/reference/diagnostics-prometheus)** (`@zuvix/diagnostics-prometheus`) - npm; ClawHub: `clawhub:@zuvix/diagnostics-prometheus`. Zuvix diagnostics Prometheus exporter for runtime metrics.

- **[diffs](/plugins/reference/diffs)** (`@zuvix/diffs`) - npm; ClawHub. Zuvix read-only diff viewer plugin and file renderer for agents.

- **[diffs-language-pack](/plugins/reference/diffs-language-pack)** (`@zuvix/diffs-language-pack`) - npm; ClawHub: `clawhub:@zuvix/diffs-language-pack`. Adds syntax highlighting for languages outside the default diffs viewer set.

- **[discord](/plugins/reference/discord)** (`@zuvix/discord`) - npm; ClawHub. Zuvix Discord channel plugin for channels, DMs, commands, and app events.

- **[feishu](/plugins/reference/feishu)** (`@zuvix/feishu`) - npm; ClawHub. Zuvix Feishu/Lark channel plugin for chats and workplace tools (community maintained by @m1heng).

- **[google-meet](/plugins/reference/google-meet)** (`@zuvix/google-meet`) - npm; ClawHub. Zuvix Google Meet participant plugin for joining calls through Chrome or Twilio transports.

- **[googlechat](/plugins/reference/googlechat)** (`@zuvix/googlechat`) - npm; ClawHub. Zuvix Google Chat channel plugin for spaces and direct messages.

- **[line](/plugins/reference/line)** (`@zuvix/line`) - npm; ClawHub. Zuvix LINE channel plugin for LINE Bot API chats.

- **[llama-cpp](/plugins/reference/llama-cpp)** (`@zuvix/llama-cpp-provider`) - npm; ClawHub. Local GGUF embeddings through node-llama-cpp.

- **[lobster](/plugins/reference/lobster)** (`@zuvix/lobster`) - npm; ClawHub. Lobster workflow tool plugin for typed pipelines and resumable approvals.

- **[matrix](/plugins/reference/matrix)** (`@zuvix/matrix`) - ClawHub: `clawhub:@zuvix/matrix`; npm. Zuvix Matrix channel plugin for rooms and direct messages.

- **[memory-lancedb](/plugins/reference/memory-lancedb)** (`@zuvix/memory-lancedb`) - npm; ClawHub. Zuvix LanceDB-backed long-term memory plugin with auto-recall, auto-capture, and vector search.

- **[msteams](/plugins/reference/msteams)** (`@zuvix/msteams`) - npm; ClawHub. Zuvix Microsoft Teams channel plugin for bot conversations.

- **[nextcloud-talk](/plugins/reference/nextcloud-talk)** (`@zuvix/nextcloud-talk`) - npm; ClawHub. Zuvix Nextcloud Talk channel plugin for conversations.

- **[nostr](/plugins/reference/nostr)** (`@zuvix/nostr`) - npm; ClawHub. Zuvix Nostr channel plugin for NIP-04 encrypted direct messages.

- **[openshell](/plugins/reference/openshell)** (`@zuvix/openshell-sandbox`) - npm; ClawHub. Zuvix sandbox backend for the NVIDIA OpenShell CLI with mirrored local workspaces and SSH command execution.

- **[pixverse](/plugins/reference/pixverse)** (`@zuvix/pixverse-provider`) - npm; ClawHub: `clawhub:@zuvix/pixverse-provider`. Zuvix PixVerse video generation provider plugin.

- **[qqbot](/plugins/reference/qqbot)** (`@zuvix/qqbot`) - npm; ClawHub. Zuvix QQ Bot channel plugin for group and direct-message workflows.

- **[slack](/plugins/reference/slack)** (`@zuvix/slack`) - npm; ClawHub. Zuvix Slack channel plugin for channels, DMs, commands, and app events.

- **[synology-chat](/plugins/reference/synology-chat)** (`@zuvix/synology-chat`) - npm; ClawHub. Synology Chat channel plugin for Zuvix channels and direct messages.

- **[tlon](/plugins/reference/tlon)** (`@zuvix/tlon`) - npm; ClawHub. Zuvix Tlon/Urbit channel plugin for chat workflows.

- **[tokenjuice](/plugins/reference/tokenjuice)** (`@zuvix/tokenjuice`) - npm; ClawHub: `clawhub:@zuvix/tokenjuice`. Compacts exec and bash tool results with tokenjuice reducers.

- **[twitch](/plugins/reference/twitch)** (`@zuvix/twitch`) - npm; ClawHub. Zuvix Twitch channel plugin for chat and moderation workflows.

- **[voice-call](/plugins/reference/voice-call)** (`@zuvix/voice-call`) - npm; ClawHub. Zuvix voice-call plugin for Twilio, Telnyx, and Plivo phone calls.

- **[whatsapp](/plugins/reference/whatsapp)** (`@zuvix/whatsapp`) - ClawHub: `clawhub:@zuvix/whatsapp`; npm. Zuvix WhatsApp channel plugin for WhatsApp Web chats.

- **[zalo](/plugins/reference/zalo)** (`@zuvix/zalo`) - npm; ClawHub. Zuvix Zalo channel plugin for bot and webhook chats.

- **[zalouser](/plugins/reference/zalouser)** (`@zuvix/zalouser`) - npm; ClawHub. Zuvix Zalo Personal Account plugin via native zca-js integration.

## Source checkout only

3 plugins

- **[qa-channel](/plugins/reference/qa-channel)** (`@zuvix/qa-channel`) - source checkout only. Adds the QA Channel surface for sending and receiving Zuvix messages.

- **[qa-lab](/plugins/reference/qa-lab)** (`@zuvix/qa-lab`) - source checkout only. Zuvix QA lab plugin with private debugger UI and scenario runner.

- **[qa-matrix](/plugins/reference/qa-matrix)** (`@zuvix/qa-matrix`) - source checkout only. Matrix QA transport runner and substrate.

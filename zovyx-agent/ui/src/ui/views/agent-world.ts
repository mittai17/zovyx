import { html, nothing } from "lit";
import { t } from "../../i18n/index.ts";
import type { AgentIdentityResult, AgentsListResult } from "../types.ts";
import {
  agentAvatarHue,
  normalizeAgentLabel,
  resolveAgentEmoji,
} from "./agents-utils.ts";

export type AgentWorldProps = {
  basePath: string;
  loading: boolean;
  error: string | null;
  agentsList: AgentsListResult | null;
  agentIdentityById: Record<string, AgentIdentityResult>;
  onRefresh: () => void;
  onNavigateToAgent: (agentId: string) => void;
};

type AgentCard = {
  id: string;
  label: string;
  emoji: string;
  hue: number;
  model: string;
  runtime: string;
  workspace: string;
  isDefault: boolean;
};

function buildCards(props: AgentWorldProps): AgentCard[] {
  const agents = props.agentsList?.agents ?? [];
  const defaultId = props.agentsList?.defaultId ?? null;
  return agents.map((agent) => ({
    id: agent.id,
    label: normalizeAgentLabel(agent),
    emoji: resolveAgentEmoji(agent, props.agentIdentityById[agent.id] ?? null),
    hue: agentAvatarHue(agent.id),
    model: agent.model?.id ?? "",
    runtime: agent.agentRuntime ?? "",
    workspace: agent.workspace ?? "",
    isDefault: agent.id === defaultId,
  }));
}

export function renderAgentWorld(props: AgentWorldProps) {
  const cards = buildCards(props);

  return html`
    <div class="agent-world">
      <div class="agent-world__header">
        <div class="agent-world__title-row">
          <h2 class="agent-world__title">${t("tabs.agentWorld")}</h2>
          <button
            type="button"
            class="btn btn--sm"
            ?disabled=${props.loading}
            @click=${props.onRefresh}
          >
            ${props.loading ? t("common.loading") : t("common.refresh")}
          </button>
        </div>
        <p class="agent-world__subtitle">${t("subtitles.agentWorld")}</p>
      </div>

      ${props.error
        ? html`<div class="callout danger">${props.error}</div>`
        : nothing}

      ${props.loading && cards.length === 0
        ? html`<div class="agent-world__loading">
            ${[1, 2, 3, 4].map(
              (i) => html`<div class="agent-world__skeleton skeleton"></div>`,
            )}
          </div>`
        : nothing}

      <div class="agent-world__grid">
        ${cards.map(
          (card) => html`
            <button
              type="button"
              class="agent-world__card"
              style="--agent-hue: ${card.hue}"
              @click=${() => props.onNavigateToAgent(card.id)}
            >
              <div class="agent-world__card-avatar">
                ${card.emoji
                  ? html`<span class="agent-world__card-emoji">${card.emoji}</span>`
                  : html`
                      <span class="agent-world__card-initial">
                        ${card.label.charAt(0).toUpperCase()}
                      </span>
                    `}
              </div>
              <div class="agent-world__card-body">
                <div class="agent-world__card-name">
                  ${card.label}
                  ${card.isDefault
                    ? html`<span class="agent-world__card-badge">${t("agents.default")}</span>`
                    : nothing}
                </div>
                ${card.model
                  ? html`<div class="agent-world__card-model">${card.model}</div>`
                  : nothing}
                <div class="agent-world__card-meta">
                  ${card.runtime
                    ? html`<span class="agent-world__card-tag">${card.runtime}</span>`
                    : nothing}
                  ${card.workspace
                    ? html`<span class="agent-world__card-tag">${card.workspace}</span>`
                    : nothing}
                </div>
              </div>
              <div class="agent-world__card-glow"></div>
            </button>
          `,
        )}
      </div>

      ${!props.loading && cards.length === 0 && !props.error
        ? html`<div class="card">
            <div class="card-title">${t("agents.noAgents")}</div>
          </div>`
        : nothing}
    </div>

    <style>
      .agent-world {
        padding: 8px 4px;
      }
      .agent-world__header {
        margin-bottom: 24px;
      }
      .agent-world__title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .agent-world__title {
        margin: 0;
        font-size: 22px;
        font-weight: 650;
        letter-spacing: -0.03em;
        color: var(--accent);
      }
      .agent-world__subtitle {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 13px;
      }
      .agent-world__loading {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
      .agent-world__skeleton {
        height: 160px;
      }
      .agent-world__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
      .agent-world__card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        background: var(--card);
        cursor: pointer;
        text-align: left;
        font: inherit;
        color: inherit;
        overflow: hidden;
        transition: border-color var(--duration-normal) var(--ease-out),
          box-shadow var(--duration-normal) var(--ease-out),
          transform var(--duration-normal) var(--ease-out);
      }
      .agent-world__card:hover {
        border-color: var(--border-strong);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      .agent-world__card:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }
      .agent-world__card-glow {
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at top right,
          color-mix(in srgb, var(--accent) 8%, transparent) 0%,
          transparent 70%
        );
        pointer-events: none;
        transition: opacity var(--duration-normal) var(--ease-out);
        opacity: 0;
      }
      .agent-world__card:hover .agent-world__card-glow {
        opacity: 1;
      }
      .agent-world__card-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        background: color-mix(
          in srgb,
          hsl(var(--agent-hue), 70%, 80%) 60%,
          var(--card) 40%
        );
        font-size: 22px;
        flex-shrink: 0;
        box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
          0 4px 12px color-mix(in srgb, hsl(var(--agent-hue), 70%, 70%) 20%, transparent);
      }
      :root[data-theme-mode="dark"] .agent-world__card-avatar {
        background: color-mix(
          in srgb,
          hsl(var(--agent-hue), 50%, 30%) 60%,
          var(--card) 40%
        );
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 4px 12px color-mix(in srgb, hsl(var(--agent-hue), 70%, 30%) 20%, transparent);
      }
      .agent-world__card-initial {
        font-size: 20px;
        font-weight: 700;
        color: hsl(var(--agent-hue), 50%, 30%);
      }
      :root[data-theme-mode="dark"] .agent-world__card-initial {
        color: hsl(var(--agent-hue), 60%, 80%);
      }
      .agent-world__card-emoji {
        line-height: 1;
      }
      .agent-world__card-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .agent-world__card-name {
        font-size: 15px;
        font-weight: 650;
        color: var(--text-strong);
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .agent-world__card-badge {
        display: inline-flex;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: var(--radius-full);
        background: var(--accent-subtle);
        color: var(--accent);
        white-space: nowrap;
        flex-shrink: 0;
      }
      .agent-world__card-model {
        font-size: 12px;
        font-family: var(--mono);
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .agent-world__card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;
      }
      .agent-world__card-tag {
        display: inline-flex;
        font-size: 11px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: var(--radius-full);
        background: var(--secondary);
        border: 1px solid var(--border);
        color: var(--muted-strong);
      }

      /* Light theme claymorphism on cards */
      :root[data-theme-mode="light"] .agent-world__card {
        box-shadow: var(--clay-shadow-strong, none);
      }
      :root[data-theme-mode="light"] .agent-world__card:hover {
        box-shadow: var(--clay-shadow-strong, none), var(--shadow-md);
      }
      :root[data-theme-mode="light"] .agent-world__card-tag {
        box-shadow: var(--clay-shadow, none);
      }

      @media (max-width: 768px) {
        .agent-world {
          padding: 4px 0;
        }
        .agent-world__header {
          margin-bottom: 16px;
        }
        .agent-world__title {
          font-size: 18px;
        }
        .agent-world__grid {
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 0 4px;
        }
        .agent-world__card {
          flex-direction: row;
          align-items: center;
          padding: 14px;
          gap: 14px;
        }
        .agent-world__card-body {
          flex: 1;
          min-width: 0;
        }
        .agent-world__card-avatar {
          width: 40px;
          height: 40px;
          font-size: 18px;
          flex-shrink: 0;
        }
        .agent-world__card-name {
          font-size: 14px;
        }
        .agent-world__card-model {
          font-size: 11px;
        }
        .agent-world__card-glow {
          display: none;
        }
        .agent-world__card:hover {
          transform: none;
        }
        .agent-world__card:active {
          transform: scale(0.98);
        }
      }
    </style>
  `;
}

import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { supabase } from "../supabase.ts";
import { normalizeBasePath } from "../navigation.ts";
import { agentLogoUrl } from "./agents-utils.ts";

@customElement("credentials-modal")
export class CredentialsModal extends LitElement {
  @state() openAiKey = "";
  @state() anthropicKey = "";
  @state() loading = false;
  @state() error: string | null = null;
  @state() isOpen = false;

  private userId: string | null = null;
  private onComplete: (() => void) | null = null;

  createRenderRoot() {
    return this;
  }

  async open(userId: string, onComplete: () => void) {
    this.userId = userId;
    this.onComplete = onComplete;
    this.isOpen = true;
    this.error = null;
    this.openAiKey = "";
    this.anthropicKey = "";
  }

  close() {
    this.isOpen = false;
    this.onComplete?.();
  }

  async handleSave() {
    if (!this.userId) return;
    
    this.loading = true;
    this.error = null;

    const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    try {
      // In local dev, skip subscription check and save to localStorage
      if (isLocalDev) {
        if (this.openAiKey) localStorage.setItem("zuvix_openai_key", this.openAiKey);
        if (this.anthropicKey) localStorage.setItem("zuvix_anthropic_key", this.anthropicKey);
        this.close();
        return;
      }

      // Check subscription first
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", this.userId)
        .single();

      if (!subscription || subscription.status !== "active") {
        this.isOpen = false;
        // Trigger upgrade modal
        const upgradeModal = document.querySelector("upgrade-modal") as any;
        if (upgradeModal) {
          upgradeModal.open(this.userId, () => {
            this.isOpen = true;
          });
        }
        return;
      }

      // Get Supabase profile ID
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("appwrite_user_id", this.userId)
        .single();

      if (profile) {
        if (this.openAiKey) {
          await supabase.from("user_credentials").upsert(
            {
              profile_id: profile.id,
              provider: "openai",
              encrypted_api_key: btoa(this.openAiKey),
            },
            { onConflict: "profile_id,provider" }
          );
        }
        if (this.anthropicKey) {
          await supabase.from("user_credentials").upsert(
            {
              profile_id: profile.id,
              provider: "anthropic",
              encrypted_api_key: btoa(this.anthropicKey),
            },
            { onConflict: "profile_id,provider" }
          );
        }
        this.close();
      }
    } catch (e: any) {
      this.error = e.message || "Failed to save credentials";
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (!this.isOpen) return html``;

    return html`
      <div class="modal-overlay" @click=${(e: Event) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
          this.close();
        }
      }}>
        <div class="modal-card">
          <div class="modal-card__header modal-card__header--credentials">
            <h3>Configure Provider</h3>
            <p>You need to provide an API key to start chatting. Keys are encrypted and synced to your cloud vault.</p>
          </div>
          
          <div class="modal-card__body">
            ${this.error
              ? html`<div class="callout danger">${this.error}</div>`
              : ""}

            <label class="field">
              <span>OpenAI API Key</span>
              <input
                type="password"
                .value=${this.openAiKey}
                @input=${(e: Event) => (this.openAiKey = (e.target as HTMLInputElement).value)}
                placeholder="sk-..."
              />
            </label>

            <label class="field">
              <span>Anthropic API Key (Optional)</span>
              <input
                type="password"
                .value=${this.anthropicKey}
                @input=${(e: Event) => (this.anthropicKey = (e.target as HTMLInputElement).value)}
                placeholder="sk-ant-..."
              />
            </label>
          </div>

          <div class="modal-card__footer">
            <button
              class="btn"
              @click=${() => this.close()}
            >
              Later
            </button>
            <button
              class="btn primary"
              @click=${() => this.handleSave()}
              ?disabled=${this.loading || (!this.openAiKey && !this.anthropicKey)}
            >
              ${this.loading ? "Saving..." : "Save & Secure"}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

export function renderCredentialsModal() {
  return html`<credentials-modal></credentials-modal>`;
}

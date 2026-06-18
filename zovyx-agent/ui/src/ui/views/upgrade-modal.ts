import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { supabase } from "../supabase.ts";

@customElement("upgrade-modal")
export class UpgradeModal extends LitElement {
  @state() loading = false;
  @state() isOpen = false;

  private userId: string | null = null;
  private onBack: (() => void) | null = null;

  createRenderRoot() {
    return this;
  }

  open(userId: string, onBack: () => void) {
    this.userId = userId;
    this.onBack = onBack;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  async handleCheckout() {
    if (!this.userId) return;
    
    this.loading = true;
    // In local dev, bypass Stripe and close
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      this.close();
      this.loading = false;
      return;
    }
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: this.userId,
          returnUrl: window.location.href,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error("Checkout failed");
    } finally {
      this.loading = false;
    }
  }

  handleBack() {
    this.isOpen = false;
    this.onBack?.();
  }

  render() {
    if (!this.isOpen) return html``;

    return html`
      <div class="modal-overlay" @click=${(e: Event) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
          this.close();
        }
      }}>
        <div class="modal-card modal-card--upgrade">
          <div class="modal-card__header modal-card__header--upgrade">
            <h3>Zuvix Cloud Sync</h3>
            <p>Local execution is free forever. Upgrade to Cloud Sync to securely share your API Keys and Settings across all your devices.</p>
          </div>
          
          <div class="modal-card__body">
            <div class="upgrade-plan">
              <div class="upgrade-plan__info">
                <h4>Pro Sync Plan</h4>
                <p>Unlimited encrypted cloud vault</p>
              </div>
              <div class="upgrade-plan__price">
                <span class="upgrade-plan__amount">$4.99</span>
                <span class="upgrade-plan__period">/mo</span>
              </div>
            </div>
          </div>

          <div class="modal-card__footer">
            <button
              class="btn"
              @click=${() => this.handleBack()}
            >
              Stay Local
            </button>
            <button
              class="btn primary upgrade-plan__button"
              @click=${() => this.handleCheckout()}
              ?disabled=${this.loading}
            >
              ${this.loading ? "Redirecting..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

export function renderUpgradeModal() {
  return html`<upgrade-modal></upgrade-modal>`;
}

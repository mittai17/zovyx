import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { supabase } from "../supabase.ts";
import { normalizeBasePath } from "../navigation.ts";
import { agentLogoUrl } from "./agents-utils.ts";
import type { AppViewState } from "../app-view-state.ts";

@customElement("supabase-login")
export class SupabaseLogin extends LitElement {
  @state() email = "";
  @state() password = "";
  @state() loading = false;
  @state() isSignUp = false;
  @state() error: string | null = null;

  // We reuse the app's global stylesheet by not using shadow DOM
  createRenderRoot() {
    return this;
  }

  async handleAuth(e: Event) {
    e.preventDefault();
    this.loading = true;
    this.error = null;
    
    try {
      if (this.isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: this.email,
          password: this.password,
        });
        if (error) throw error;
        // Depending on supabase settings, might need email verification
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      this.error = err.message || "Authentication failed";
    } finally {
      this.loading = false;
    }
  }

  render() {
    const faviconSrc = agentLogoUrl(normalizeBasePath(""));

    return html`
      <div class="login-gate">
        <div class="login-gate__card">
          <div class="login-gate__header">
            <img class="login-gate__logo" src=${faviconSrc} alt="Zuvix" />
            <div class="login-gate__title">Zuvix</div>
            <div class="login-gate__sub">Please log in to continue</div>
          </div>
          
          <form class="login-gate__form" @submit=${this.handleAuth}>
            <label class="field">
              <span>Email</span>
              <input
                type="email"
                required
                .value=${this.email}
                @input=${(e: Event) => (this.email = (e.target as HTMLInputElement).value)}
                placeholder="your@email.com"
              />
            </label>

            <label class="field">
              <span>Password</span>
              <input
                type="password"
                required
                .value=${this.password}
                @input=${(e: Event) => (this.password = (e.target as HTMLInputElement).value)}
                placeholder="••••••••"
              />
            </label>

            ${this.error
              ? html`<div class="callout danger" style="margin-top: 1rem;">${this.error}</div>`
              : ""}

            <button
              type="submit"
              class="btn primary login-gate__connect"
              style="margin-top: 1.5rem;"
              ?disabled=${this.loading}
            >
              ${this.loading ? "Loading..." : this.isSignUp ? "Sign Up" : "Log In"}
            </button>
            
            <div style="text-align: center; margin-top: 1rem;">
              <button
                type="button"
                class="btn"
                style="background: transparent; color: var(--text-color);"
                @click=${() => {
                  this.isSignUp = !this.isSignUp;
                  this.error = null;
                }}
              >
                ${this.isSignUp
                  ? "Already have an account? Log In"
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

export function renderSupabaseLogin(state: AppViewState) {
  return html`<supabase-login></supabase-login>`;
}

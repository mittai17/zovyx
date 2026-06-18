import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { supabase } from "../supabase.ts";
import { normalizeBasePath } from "../navigation.ts";
import { agentLogoUrl } from "./agents-utils.ts";
import { saveLocalUserIdentity } from "../storage.ts";
import type { AppViewState } from "../app-view-state.ts";

// Appwrite client setup
let appwriteClient: any = null;
let appwriteAccount: any = null;

async function initAppwrite() {
  if (appwriteClient) return { client: appwriteClient, account: appwriteAccount };
  
  try {
    const { Client, Account } = await import("appwrite");
    appwriteClient = new Client();
    appwriteClient
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "replace-with-project-id");
    appwriteAccount = new Account(appwriteClient);
    return { client: appwriteClient, account: appwriteAccount };
  } catch {
    return null;
  }
}

@customElement("supabase-login")
export class SupabaseLogin extends LitElement {
  @state() email = "";
  @state() password = "";
  @state() name = "";
  @state() loading = false;
  @state() isSignUp = false;
  @state() error: string | null = null;
  @state() authProvider: "appwrite" | "supabase" = "appwrite";
  @state() inline = false;

  // We reuse the app's global stylesheet by not using shadow DOM
  createRenderRoot() {
    return this;
  }

  async handleAuth(e: Event) {
    e.preventDefault();
    this.loading = true;
    this.error = null;
    
    try {
      if (this.authProvider === "appwrite") {
        await this.handleAppwriteAuth();
      } else {
        await this.handleSupabaseAuth();
      }
    } catch (err: any) {
      this.error = err.message || "Authentication failed";
    } finally {
      this.loading = false;
    }
  }

  private async handleAppwriteAuth() {
    const appwrite = await initAppwrite();
    if (!appwrite) {
      throw new Error("Appwrite not configured. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID.");
    }

    const { account } = appwrite;

    try {
      // Try login first
      await account.createEmailPasswordSession(this.email, this.password);
      const user = await account.get();
      const resolvedName = user.name || this.name || this.email.split("@")[0];

      // Save identity locally
      saveLocalUserIdentity({ name: resolvedName, avatar: null });

      // Sync profile to Supabase
      await this.syncProfileToSupabase(user.$id, resolvedName);

      // Notify parent
      this.dispatchEvent(new CustomEvent("auth-success", {
        detail: { name: resolvedName, email: this.email, id: user.$id },
        bubbles: true,
        composed: true,
      }));
    } catch (e: any) {
      // If login fails, try signup
      if (e.code === 401 || e.code === 404 || e.message?.includes("Invalid credentials")) {
        if (!this.name.trim()) {
          throw new Error("Name is required for sign up.");
        }
        const { ID } = await import("appwrite");
        await account.create(ID.unique(), this.email, this.password, this.name);
        await account.createEmailPasswordSession(this.email, this.password);
        const user = await account.get();
        const resolvedName = user.name || this.name;

        // Save identity locally
        saveLocalUserIdentity({ name: resolvedName, avatar: null });

        // Sync profile to Supabase
        await this.syncProfileToSupabase(user.$id, resolvedName);

        // Notify parent
        this.dispatchEvent(new CustomEvent("auth-success", {
          detail: { name: resolvedName, email: this.email, id: user.$id },
          bubbles: true,
          composed: true,
        }));
      } else {
        throw e;
      }
    }
  }

  private async syncProfileToSupabase(appwriteUserId: string, displayName?: string) {
    try {
      const payload: Record<string, any> = { appwrite_user_id: appwriteUserId };
      if (displayName) payload.display_name = displayName;
      await supabase.from("user_profiles").upsert(
        payload,
        { onConflict: "appwrite_user_id" }
      );
    } catch {
      // Profile sync is non-critical
    }
  }

  private async handleSupabaseAuth() {
    if (this.isSignUp) {
      if (!this.name.trim()) {
        throw new Error("Name is required for sign up.");
      }
      const { error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
        options: { data: { display_name: this.name } },
      });
      if (error) throw error;
      // Save identity locally
      saveLocalUserIdentity({ name: this.name, avatar: null });
      this.dispatchEvent(new CustomEvent("auth-success", {
        detail: { name: this.name, email: this.email },
        bubbles: true,
        composed: true,
      }));
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });
      if (error) throw error;
      // Fetch user metadata for name
      const displayName = data.user?.user_metadata?.display_name || data.user?.email?.split("@")[0] || "User";
      saveLocalUserIdentity({ name: displayName, avatar: null });
      this.dispatchEvent(new CustomEvent("auth-success", {
        detail: { name: displayName, email: this.email, id: data.user?.id },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    const faviconSrc = agentLogoUrl(normalizeBasePath(""));

    if (this.inline) {
      return html`
        <form class="login-gate__form" @submit=${this.handleAuth}>
          ${this.isSignUp ? html`
          <label class="field">
            <span>Name</span>
            <input
              type="text"
              required
              .value=${this.name}
              @input=${(e: Event) => (this.name = (e.target as HTMLInputElement).value)}
              placeholder="Your name"
            />
          </label>
          ` : ""}

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
            class="btn primary"
            style="margin-top: 1.5rem; width: 100%;"
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

          <div style="text-align: center; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <span style="color: var(--text-color-muted); font-size: 0.875rem;">Auth Provider:</span>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; justify-content: center;">
              <button
                type="button"
                class="btn"
                style=${this.authProvider === "appwrite"
                  ? "background: var(--primary-color); color: white;"
                  : "background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color);"}
                @click=${() => { this.authProvider = "appwrite"; this.error = null; }}
              >
                Appwrite
              </button>
              <button
                type="button"
                class="btn"
                style=${this.authProvider === "supabase"
                  ? "background: var(--primary-color); color: white;"
                  : "background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color);"}
                @click=${() => { this.authProvider = "supabase"; this.error = null; }}
              >
                Supabase
              </button>
            </div>
          </div>
        </form>
      `;
    }

    return html`
      <div class="login-gate">
        <div class="login-gate__card">
          <div class="login-gate__header">
            <img class="login-gate__logo" src=${faviconSrc} alt="Zuvix" />
            <div class="login-gate__title">Zuvix</div>
            <div class="login-gate__sub">Please log in to continue</div>
          </div>
          
          <form class="login-gate__form" @submit=${this.handleAuth}>
            ${this.isSignUp ? html`
            <label class="field">
              <span>Name</span>
              <input
                type="text"
                required
                .value=${this.name}
                @input=${(e: Event) => (this.name = (e.target as HTMLInputElement).value)}
                placeholder="Your name"
              />
            </label>
            ` : ""}

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

            <div style="text-align: center; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
              <span style="color: var(--text-color-muted); font-size: 0.875rem;">Or continue with:</span>
              <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; justify-content: center;">
                <button
                  type="button"
                  class="btn"
                  style=${this.authProvider === "appwrite"
                    ? "background: var(--primary-color); color: white;"
                    : "background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color);"}
                  @click=${() => { this.authProvider = "appwrite"; this.error = null; }}
                >
                  Appwrite
                </button>
                <button
                  type="button"
                  class="btn"
                  style=${this.authProvider === "supabase"
                    ? "background: var(--primary-color); color: white;"
                    : "background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color);"}
                  @click=${() => { this.authProvider = "supabase"; this.error = null; }}
                >
                  Supabase
                </button>
              </div>
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

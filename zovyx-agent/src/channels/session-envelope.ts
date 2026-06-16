// Session-envelope context resolver for inbound channel turns.
import { resolveEnvelopeFormatOptions } from "../auto-reply/envelope.js";
import { readSessionUpdatedAt, resolveStorePath } from "../config/sessions.js";
import type { ZuvixConfig } from "../config/types.zuvix.js";

/** Resolves envelope options and previous timestamp for one inbound channel session. */
export function resolveInboundSessionEnvelopeContext(params: {
  cfg: ZuvixConfig;
  agentId: string;
  sessionKey: string;
}) {
  const storePath = resolveStorePath(params.cfg.session?.store, {
    agentId: params.agentId,
  });
  return {
    storePath,
    envelopeOptions: resolveEnvelopeFormatOptions(params.cfg),
    previousTimestamp: readSessionUpdatedAt({
      storePath,
      sessionKey: params.sessionKey,
    }),
  };
}

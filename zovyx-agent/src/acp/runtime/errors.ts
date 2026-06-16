/** ACP runtime error exports wired to Zuvix secret redaction. */
import { configureAcpErrorRedactor } from "@zuvix/acp-core";
import { redactSensitiveText } from "../../logging/redact.js";

// Ensure ACP-core runtime errors use Zuvix's secret redaction before re-export.
configureAcpErrorRedactor(redactSensitiveText);

export * from "@zuvix/acp-core/runtime/errors";

// Error output tests cover program-level error display and exit messaging.
import { describe, expect, it } from "vitest";
import { formatCliParseErrorOutput } from "./error-output.js";

describe("formatCliParseErrorOutput", () => {
  it("explains unknown commands with root help and plugin hints", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'wat'\n", {
      argv: ["node", "zuvix", "wat"],
    });

    expect(output).toBe(
      'Zuvix does not know the command "wat".\nTry: zuvix --help\nPlugin command? zuvix plugins list\nDocs: https://docs.zuvix.ai/cli\n',
    );
  });

  it("points unknown options at the active command help", () => {
    const output = formatCliParseErrorOutput("error: unknown option '--wat'\n", {
      argv: ["node", "zuvix", "channels", "status", "--wat"],
    });

    expect(output).toBe(
      'Zuvix does not recognize option "--wat".\nTry: zuvix channels status --help\n',
    );
  });

  it("points missing required arguments at command help", () => {
    const output = formatCliParseErrorOutput("error: missing required argument 'name'\n", {
      argv: ["node", "zuvix", "plugins", "install"],
    });

    expect(output).toBe(
      'Missing required argument "name".\nTry: zuvix plugins install --help\n',
    );
  });
});

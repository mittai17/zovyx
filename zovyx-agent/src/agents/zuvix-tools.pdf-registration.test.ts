// Verifies PDF tool factory output is included in Zuvix tool registration.
import { describe, expect, it } from "vitest";
import { collectPresentZuvixTools } from "./zuvix-tools.registration.js";
import { createPdfTool } from "./tools/pdf-tool.js";

describe("createZuvixTools PDF registration", () => {
  it("includes the pdf tool when the pdf factory returns a tool", () => {
    const pdfTool = createPdfTool({
      agentDir: "/tmp/zuvix-agent-main",
      config: {
        agents: {
          defaults: {
            pdfModel: { primary: "openai/gpt-5.4-mini" },
          },
        },
      },
    });

    expect(pdfTool?.name).toBe("pdf");
    expect(collectPresentZuvixTools([pdfTool]).map((tool) => tool.name)).toEqual(["pdf"]);
  });
});

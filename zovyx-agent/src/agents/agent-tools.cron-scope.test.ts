/**
 * Tests cron-triggered tool assembly.
 * Ensures cron runs scope cron tool behavior to self-removal of the current
 * job only.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyAgentTool } from "./tools/common.js";

const mocks = vi.hoisted(() => {
  const stubTool = (name: string) =>
    ({
      name,
      label: name,
      displaySummary: name,
      description: name,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    }) satisfies AnyAgentTool;

  return {
    createZuvixToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./zuvix-tools.js", () => ({
  createZuvixTools: (options: unknown) => {
    mocks.createZuvixToolsOptions(options);
    return [mocks.stubTool("cron")];
  },
}));

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createZuvixCodingTools } from "./agent-tools.js";

function firstZuvixToolsOptions(): { cronSelfRemoveOnlyJobId?: string } | undefined {
  return mocks.createZuvixToolsOptions.mock.calls[0]?.[0] as
    | { cronSelfRemoveOnlyJobId?: string }
    | undefined;
}

describe("createZuvixCodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createZuvixToolsOptions.mockClear();
  });

  it("scopes cron-triggered jobs to self-removal", () => {
    const tools = createZuvixCodingTools({
      trigger: "cron",
      jobId: "job-current",
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    expect(firstZuvixToolsOptions()?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope non-cron sessions", () => {
    createZuvixCodingTools({
      trigger: "user",
      jobId: "job-current",
    });

    expect(firstZuvixToolsOptions()?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});

// Irc tests cover monitor plugin behavior.
import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#zuvix",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#zuvix",
      rawTarget: "#zuvix",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "zuvix-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "zuvix-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "zuvix-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "zuvix-bot",
      rawTarget: "zuvix-bot",
    });
  });
});

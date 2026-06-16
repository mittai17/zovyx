// Logger browser import tests cover safe import behavior in browser-like runtimes.
import { importFreshModule } from "zuvix/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredZuvixTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredZuvixTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredZuvixTmpDir =
    params?.resolvePreferredZuvixTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredZuvixTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-zuvix-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-zuvix-dir.js")>(
      "../infra/tmp-zuvix-dir.js",
    );
    return {
      ...actual,
      resolvePreferredZuvixTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredZuvixTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-zuvix-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredZuvixTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredZuvixTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/zuvix");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/zuvix/zuvix.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredZuvixTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toStrictEqual({
      level: "silent",
      file: "/tmp/zuvix/zuvix.log",
      maxFileBytes: 100 * 1024 * 1024,
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(module.getLogger().info("browser-safe")).toBeUndefined();
    expect(resolvePreferredZuvixTmpDir).not.toHaveBeenCalled();
  });
});

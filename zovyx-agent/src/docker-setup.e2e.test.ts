// E2E tests for Docker setup script behavior and generated commands.
import { spawnSync } from "node:child_process";
import { chmod, copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSuiteTempRootTracker } from "./test-helpers/temp-dir.js";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

type DockerSetupSandbox = {
  rootDir: string;
  scriptPath: string;
  logPath: string;
  binDir: string;
};

async function writeDockerStub(binDir: string, logPath: string) {
  const stub = `#!/usr/bin/env bash
set -euo pipefail
log="$DOCKER_STUB_LOG"
fail_match="\${DOCKER_STUB_FAIL_MATCH:-}"
if [[ "\${1:-}" == "compose" && "\${2:-}" == "version" ]]; then
  exit 0
fi
if [[ "\${1:-}" == "build" ]]; then
  if [[ -n "$fail_match" && "$*" == *"$fail_match"* ]]; then
    echo "build-fail $*" >>"$log"
    exit 1
  fi
  echo "build DOCKER_BUILDKIT=\${DOCKER_BUILDKIT:-} $*" >>"$log"
  exit 0
fi
if [[ "\${1:-}" == "compose" ]]; then
  if [[ -n "$fail_match" && "$*" == *"$fail_match"* ]]; then
    echo "compose-fail $*" >>"$log"
    exit 1
  fi
  echo "compose $*" >>"$log"
  exit 0
fi
echo "unknown $*" >>"$log"
exit 0
`;

  await mkdir(binDir, { recursive: true });
  await writeFile(join(binDir, "docker"), stub, { mode: 0o755 });
  await writeFile(logPath, "");
}

async function expectMissingPath(path: string): Promise<void> {
  try {
    await stat(path);
  } catch (error) {
    expect((error as NodeJS.ErrnoException).code).toBe("ENOENT");
    return;
  }
  throw new Error(`Expected missing path: ${path}`);
}

async function createDockerSetupSandbox(): Promise<DockerSetupSandbox> {
  const rootDir = await sandboxRootTracker.make("suite");
  const scriptPath = join(rootDir, "scripts", "docker", "setup.sh");
  const dockerfilePath = join(rootDir, "Dockerfile");
  const composePath = join(rootDir, "docker-compose.yml");
  const binDir = join(rootDir, "bin");
  const logPath = join(rootDir, "docker-stub.log");

  await mkdir(join(rootDir, "scripts", "docker"), { recursive: true });
  await mkdir(join(rootDir, "scripts", "lib"), { recursive: true });
  await copyFile(join(repoRoot, "scripts", "docker", "setup.sh"), scriptPath);
  await copyFile(
    join(repoRoot, "scripts", "lib", "docker-build.sh"),
    join(rootDir, "scripts", "lib", "docker-build.sh"),
  );
  await copyFile(
    join(repoRoot, "scripts", "lib", "docker-e2e-logs.sh"),
    join(rootDir, "scripts", "lib", "docker-e2e-logs.sh"),
  );
  await copyFile(
    join(repoRoot, "scripts", "lib", "docker-e2e-container.sh"),
    join(rootDir, "scripts", "lib", "docker-e2e-container.sh"),
  );
  await chmod(scriptPath, 0o755);
  await writeFile(dockerfilePath, "FROM scratch\n");
  await writeFile(
    composePath,
    "services:\n  zuvix-gateway:\n    image: noop\n  zuvix-cli:\n    image: noop\n",
  );
  await writeDockerStub(binDir, logPath);

  return { rootDir, scriptPath, logPath, binDir };
}

const sandboxRootTracker = createSuiteTempRootTracker({ prefix: "zuvix-docker-setup-" });

const prestartContainerEnvFlags = [
  "-e HOME=/home/node",
  "-e ZUVIX_HOME=/home/node",
  "-e ZUVIX_STATE_DIR=/home/node/.zuvix",
  "-e ZUVIX_CONFIG_PATH=/home/node/.zuvix/zuvix.json",
  "-e ZUVIX_CONFIG_DIR=/home/node/.zuvix",
  "-e ZUVIX_WORKSPACE_DIR=/home/node/.zuvix/workspace",
].join(" ");

function createEnv(
  sandbox: DockerSetupSandbox,
  overrides: Record<string, string | undefined> = {},
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    PATH: `${sandbox.binDir}:${process.env.PATH ?? ""}`,
    HOME: process.env.HOME ?? sandbox.rootDir,
    LANG: process.env.LANG,
    LC_ALL: process.env.LC_ALL,
    TMPDIR: process.env.TMPDIR,
    DOCKER_STUB_LOG: sandbox.logPath,
    ZUVIX_GATEWAY_TOKEN: "test-token",
    ZUVIX_CONFIG_DIR: join(sandbox.rootDir, "config"),
    ZUVIX_WORKSPACE_DIR: join(sandbox.rootDir, "zuvix"),
    ZUVIX_AUTH_PROFILE_SECRET_DIR: join(sandbox.rootDir, "auth-profile-secrets"),
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }
  return env;
}

function requireSandbox(sandbox: DockerSetupSandbox | null): DockerSetupSandbox {
  if (!sandbox) {
    throw new Error("sandbox missing");
  }
  return sandbox;
}

function runDockerSetup(
  sandbox: DockerSetupSandbox,
  overrides: Record<string, string | undefined> = {},
) {
  return spawnSync("bash", [sandbox.scriptPath], {
    cwd: sandbox.rootDir,
    env: createEnv(sandbox, overrides),
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function resetDockerLog(sandbox: DockerSetupSandbox) {
  await writeFile(sandbox.logPath, "");
}

async function readDockerLog(sandbox: DockerSetupSandbox) {
  return readFile(sandbox.logPath, "utf8");
}

async function readDockerLogLines(sandbox: DockerSetupSandbox) {
  const lines: string[] = [];
  for (const line of (await readDockerLog(sandbox)).split("\n")) {
    if (line) {
      lines.push(line);
    }
  }
  return lines;
}

function collectMatchingLines(lines: string[], predicate: (line: string) => boolean): string[] {
  const matches: string[] = [];
  for (const line of lines) {
    if (predicate(line)) {
      matches.push(line);
    }
  }
  return matches;
}

function isGatewayStartLine(line: string) {
  return line.includes("compose") && line.includes(" up -d") && line.includes("zuvix-gateway");
}

function findGatewayStartLineIndex(lines: string[]) {
  return lines.findIndex((line) => isGatewayStartLine(line));
}

async function runDockerSetupWithUnsetGatewayToken(
  sandbox: DockerSetupSandbox,
  suffix: string,
  prepare?: (configDir: string) => Promise<void>,
) {
  const configDir = join(sandbox.rootDir, `config-${suffix}`);
  const workspaceDir = join(sandbox.rootDir, `workspace-${suffix}`);
  await mkdir(configDir, { recursive: true });
  await prepare?.(configDir);

  const result = runDockerSetup(sandbox, {
    ZUVIX_GATEWAY_TOKEN: undefined,
    ZUVIX_CONFIG_DIR: configDir,
    ZUVIX_WORKSPACE_DIR: workspaceDir,
  });
  const envFile = await readFile(join(sandbox.rootDir, ".env"), "utf8");

  return { result, envFile };
}

async function withUnixSocket<T>(socketPath: string, run: () => Promise<T>): Promise<T> {
  const server = createServer();
  await new Promise<void>((resolveValue, reject) => {
    const onError = (error: Error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolveValue();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(socketPath);
  });

  try {
    return await run();
  } finally {
    await new Promise<void>((resolveLocal) => {
      server.close(() => resolveLocal());
    });
    await rm(socketPath, { force: true });
  }
}

function resolveBashForCompatCheck(): string | null {
  for (const candidate of ["/bin/bash", "bash"]) {
    const probe = spawnSync(candidate, ["-c", "exit 0"], { encoding: "utf8" });
    if (!probe.error && probe.status === 0) {
      return candidate;
    }
  }

  return null;
}

describe("scripts/docker/setup.sh", () => {
  let sandbox: DockerSetupSandbox | null = null;

  beforeAll(async () => {
    await sandboxRootTracker.setup();
    sandbox = await createDockerSetupSandbox();
  });

  afterAll(async () => {
    if (!sandbox) {
      await sandboxRootTracker.cleanup();
      return;
    }
    await rm(sandbox.rootDir, { recursive: true, force: true });
    await sandboxRootTracker.cleanup();
    sandbox = null;
  });

  it("handles env defaults, home-volume mounts, and Docker build args", async () => {
    const activeSandbox = requireSandbox(sandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_DOCKER_APT_PACKAGES: "curl wget",
      ZUVIX_EXTRA_MOUNTS: undefined,
      ZUVIX_HOME_VOLUME: "zuvix-home",
    });
    expect(result.status).toBe(0);
    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_IMAGE_APT_PACKAGES=curl wget");
    expect(envFile).toContain("ZUVIX_EXTRA_MOUNTS=");
    expect(envFile).toContain("ZUVIX_HOME_VOLUME=zuvix-home"); // pragma: allowlist secret
    expect(envFile).toContain("ZUVIX_DISABLE_BONJOUR=");
    expect(envFile).toContain(
      `ZUVIX_AUTH_PROFILE_SECRET_DIR=${join(activeSandbox.rootDir, "auth-profile-secrets")}`,
    );
    const extraCompose = await readFile(
      join(activeSandbox.rootDir, "docker-compose.extra.yml"),
      "utf8",
    );
    expect(extraCompose).toContain("zuvix-home:/home/node");
    expect(extraCompose).toContain(
      `${join(activeSandbox.rootDir, "auth-profile-secrets")}:/home/node/.config/zuvix`,
    );
    expect(extraCompose).toContain("volumes:");
    expect(extraCompose).toContain("zuvix-home:");
    const log = await readDockerLog(activeSandbox);
    expect(log).toContain("--build-arg ZUVIX_IMAGE_APT_PACKAGES=curl wget");
    expect(log).toContain(
      `run --rm --no-deps ${prestartContainerEnvFlags} --entrypoint node zuvix-gateway dist/index.js onboard --mode local --no-install-daemon --gateway-auth token --gateway-token-ref-env ZUVIX_GATEWAY_TOKEN --skip-ui --suppress-gateway-token-output`,
    );
    expect(result.stdout).toContain("Gateway token: stored in Docker environment/config");
    expect(result.stdout).not.toContain("test-token");
    expect(result.stdout).not.toContain("#token=");
    expect(log).toContain(
      `run --rm --no-deps ${prestartContainerEnvFlags} --entrypoint node zuvix-gateway dist/index.js config set --batch-json [{"path":"gateway.mode","value":"local"},{"path":"gateway.bind","value":"lan"},{"path":"gateway.controlUi.allowedOrigins","value":["http://localhost:18789","http://127.0.0.1:18789"]}]`,
    );
    expect(log).not.toContain("run --rm zuvix-cli onboard --mode local --no-install-daemon");
  });

  it("allows ordinary spaces in host persistence paths and quotes generated mounts", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);
    const configDir = join(activeSandbox.rootDir, "config with spaces");
    const workspaceDir = join(activeSandbox.rootDir, "workspace with spaces");
    const authProfileSecretDir = join(activeSandbox.rootDir, "auth secrets with spaces");
    const homeVolumeDir = join(activeSandbox.rootDir, "home volume with spaces");
    const extraMountSource = join(activeSandbox.rootDir, "extra data");

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_CONFIG_DIR: configDir,
      ZUVIX_WORKSPACE_DIR: workspaceDir,
      ZUVIX_AUTH_PROFILE_SECRET_DIR: authProfileSecretDir,
      ZUVIX_HOME_VOLUME: homeVolumeDir,
      ZUVIX_EXTRA_MOUNTS: `${extraMountSource}:/mnt/extra data:ro`,
    });

    expect(result.status).toBe(0);
    expect(result.stderr).not.toContain("cannot contain whitespace");
    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain(`ZUVIX_CONFIG_DIR=${configDir}`);
    expect(envFile).toContain(`ZUVIX_WORKSPACE_DIR=${workspaceDir}`);
    expect(envFile).toContain(`ZUVIX_AUTH_PROFILE_SECRET_DIR=${authProfileSecretDir}`);

    const extraCompose = await readFile(
      join(activeSandbox.rootDir, "docker-compose.extra.yml"),
      "utf8",
    );
    expect(extraCompose).toContain(`"${homeVolumeDir}:/home/node"`);
    expect(extraCompose).toContain(`"${configDir}:/home/node/.zuvix"`);
    expect(extraCompose).toContain(`"${workspaceDir}:/home/node/.zuvix/workspace"`);
    expect(extraCompose).toContain(`"${authProfileSecretDir}:/home/node/.config/zuvix"`);
    expect(extraCompose).toContain(`"${extraMountSource}:/mnt/extra data:ro"`);
  });

  it("persists explicit Docker Bonjour opt-in overrides", async () => {
    const activeSandbox = requireSandbox(sandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_DISABLE_BONJOUR: "0",
    });

    expect(result.status).toBe(0);
    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_DISABLE_BONJOUR=0");
  });

  it("normalizes legacy ZUVIX_DOCKER_APT_PACKAGES into ZUVIX_IMAGE_APT_PACKAGES", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_DOCKER_APT_PACKAGES: "curl wget",
    });
    expect(result.status).toBe(0);

    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_IMAGE_APT_PACKAGES=curl wget");
    expect(envFile).not.toContain("ZUVIX_DOCKER_APT_PACKAGES");

    const log = await readDockerLog(activeSandbox);
    expect(log).toContain("--build-arg ZUVIX_IMAGE_APT_PACKAGES=curl wget");
    expect(log).not.toContain("--build-arg ZUVIX_DOCKER_APT_PACKAGES");
  });

  it("prefers ZUVIX_IMAGE_APT_PACKAGES over legacy ZUVIX_DOCKER_APT_PACKAGES", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_IMAGE_APT_PACKAGES: "curl wget httpie",
      ZUVIX_DOCKER_APT_PACKAGES: "curl wget",
    });
    expect(result.status).toBe(0);

    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_IMAGE_APT_PACKAGES=curl wget httpie");
    expect(envFile).not.toContain("ZUVIX_DOCKER_APT_PACKAGES");

    const log = await readDockerLog(activeSandbox);
    expect(log).toContain("--build-arg ZUVIX_IMAGE_APT_PACKAGES=curl wget httpie");
    expect(log).not.toMatch(/--build-arg ZUVIX_IMAGE_APT_PACKAGES=curl wget(?! httpie)/);
  });

  it("explicitly empty ZUVIX_IMAGE_APT_PACKAGES suppresses legacy fallback", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_IMAGE_APT_PACKAGES: "",
      ZUVIX_DOCKER_APT_PACKAGES: "curl wget",
    });
    expect(result.status).toBe(0);

    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_IMAGE_APT_PACKAGES=");
    expect(envFile).not.toContain("curl wget");

    const log = await readDockerLog(activeSandbox);
    expect(log).not.toContain("--build-arg ZUVIX_IMAGE_APT_PACKAGES=curl wget");
  });

  it("avoids shared-network zuvix-cli before the gateway is started", async () => {
    const activeSandbox = requireSandbox(sandbox);

    await resetDockerLog(activeSandbox);
    const result = runDockerSetup(activeSandbox);
    expect(result.status).toBe(0);

    const lines = await readDockerLogLines(activeSandbox);
    const gatewayStartIdx = findGatewayStartLineIndex(lines);
    expect(gatewayStartIdx).toBeGreaterThanOrEqual(0);

    const prestartLines = lines.slice(0, gatewayStartIdx);
    const prestartCliRunLines = collectMatchingLines(prestartLines, (line) =>
      /\bcompose\b.*\brun\b.*\bzuvix-cli\b/.test(line),
    );
    expect(prestartCliRunLines).toStrictEqual([]);
  });

  it("pins setup-time CLI state paths inside the container", async () => {
    const activeSandbox = requireSandbox(sandbox);

    await resetDockerLog(activeSandbox);
    const result = runDockerSetup(activeSandbox, {
      ZUVIX_HOME: "/mnt/c/Users/Trevor",
      ZUVIX_STATE_DIR: "/mnt/c/Users/Trevor/.zuvix",
      ZUVIX_CONFIG_PATH: "/mnt/c/Users/Trevor/.zuvix/zuvix.json",
      ZUVIX_SKIP_ONBOARDING: "1",
    });
    expect(result.status).toBe(0);

    const lines = await readDockerLogLines(activeSandbox);
    const gatewayStartIdx = findGatewayStartLineIndex(lines);
    expect(gatewayStartIdx).toBeGreaterThanOrEqual(0);

    const prestartConfigLines = collectMatchingLines(lines.slice(0, gatewayStartIdx), (line) =>
      line.includes(" dist/index.js config "),
    );
    expect(prestartConfigLines.length).toBeGreaterThan(0);
    for (const line of prestartConfigLines) {
      expect(line).toContain(prestartContainerEnvFlags);
      expect(line).not.toContain("/mnt/c");
    }
  });

  it("forces BuildKit for local and sandbox docker builds", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await mkdir(join(activeSandbox.rootDir, "scripts", "docker", "sandbox"), { recursive: true });
    await writeFile(
      join(activeSandbox.rootDir, "scripts", "docker", "sandbox", "Dockerfile"),
      "FROM scratch\n",
    );
    await resetDockerLog(activeSandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_SANDBOX: "1",
    });

    expect(result.status).toBe(0);
    const buildLines = collectMatchingLines(await readDockerLogLines(activeSandbox), (line) =>
      line.startsWith("build "),
    );
    expect(buildLines.length).toBeGreaterThanOrEqual(2);
    const buildLinesWithoutBuildKit = collectMatchingLines(
      buildLines,
      (line) => !line.includes("DOCKER_BUILDKIT=1"),
    );
    expect(buildLinesWithoutBuildKit).toStrictEqual([]);
  });

  it("precreates config identity dir for CLI device auth writes", async () => {
    const activeSandbox = requireSandbox(sandbox);
    const configDir = join(activeSandbox.rootDir, "config-identity");
    const workspaceDir = join(activeSandbox.rootDir, "workspace-identity");

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_CONFIG_DIR: configDir,
      ZUVIX_WORKSPACE_DIR: workspaceDir,
    });

    expect(result.status).toBe(0);
    const identityDirStat = await stat(join(configDir, "identity"));
    expect(identityDirStat.isDirectory()).toBe(true);
  });

  it("writes ZUVIX_TZ into .env when given a real IANA timezone", async () => {
    const activeSandbox = requireSandbox(sandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_TZ: "Asia/Shanghai",
    });

    expect(result.status).toBe(0);
    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_TZ=Asia/Shanghai");
  });

  it("precreates agent data dirs to avoid EACCES in container", async () => {
    const activeSandbox = requireSandbox(sandbox);
    const configDir = join(activeSandbox.rootDir, "config-agent-dirs");
    const workspaceDir = join(activeSandbox.rootDir, "workspace-agent-dirs");

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_CONFIG_DIR: configDir,
      ZUVIX_WORKSPACE_DIR: workspaceDir,
    });

    expect(result.status).toBe(0);
    const agentDirStat = await stat(join(configDir, "agents", "main", "agent"));
    expect(agentDirStat.isDirectory()).toBe(true);
    const sessionsDirStat = await stat(join(configDir, "agents", "main", "sessions"));
    expect(sessionsDirStat.isDirectory()).toBe(true);

    // Verify that a root-user chown step runs before setup.
    const log = await readDockerLog(activeSandbox);
    const chownIdx = log.indexOf("--user root");
    const onboardIdx = log.indexOf("onboard");
    expect(chownIdx).toBeGreaterThanOrEqual(0);
    expect(onboardIdx).toBeGreaterThan(chownIdx);
    expect(log).toContain("run --rm --no-deps --user root --entrypoint sh zuvix-gateway -c");
    expect(log).toContain("chown node:node /home/node/.config");
  });

  it("precreates auth profile secret key dir outside the mounted state dir", async () => {
    const activeSandbox = requireSandbox(sandbox);
    const configDir = join(activeSandbox.rootDir, "config-auth-profile-key");
    const workspaceDir = join(activeSandbox.rootDir, "workspace-auth-profile-key");
    const secretDir = join(activeSandbox.rootDir, "auth-profile-secret-key");

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_CONFIG_DIR: configDir,
      ZUVIX_WORKSPACE_DIR: workspaceDir,
      ZUVIX_AUTH_PROFILE_SECRET_DIR: secretDir,
    });

    expect(result.status).toBe(0);
    const secretDirStat = await stat(secretDir);
    expect(secretDirStat.isDirectory()).toBe(true);
    expect(secretDir.startsWith(`${configDir}/`)).toBe(false);

    const log = await readDockerLog(activeSandbox);
    expect(log).toContain("find /home/node/.config/zuvix -xdev");
  });

  it("reuses existing config token when ZUVIX_GATEWAY_TOKEN is unset", async () => {
    const activeSandbox = requireSandbox(sandbox);
    const { result, envFile } = await runDockerSetupWithUnsetGatewayToken(
      activeSandbox,
      "token-reuse",
      async (configDir) => {
        await writeFile(
          join(configDir, "zuvix.json"),
          JSON.stringify({ gateway: { auth: { mode: "token", token: "config-token-123" } } }),
        );
      },
    );

    expect(result.status).toBe(0);
    expect(envFile).toContain("ZUVIX_GATEWAY_TOKEN=config-token-123"); // pragma: allowlist secret
  });

  it("reuses existing .env token when ZUVIX_GATEWAY_TOKEN and config token are unset", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await writeFile(
      join(activeSandbox.rootDir, ".env"),
      "ZUVIX_GATEWAY_TOKEN=dotenv-token-123\nZUVIX_GATEWAY_PORT=18789\n", // pragma: allowlist secret
    );
    const { result, envFile } = await runDockerSetupWithUnsetGatewayToken(
      activeSandbox,
      "dotenv-token-reuse",
    );

    expect(result.status).toBe(0);
    expect(envFile).toContain("ZUVIX_GATEWAY_TOKEN=dotenv-token-123"); // pragma: allowlist secret
    expect(result.stderr).toBe("");
  });

  it("reuses the last non-empty .env token and strips CRLF without truncating '='", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await writeFile(
      join(activeSandbox.rootDir, ".env"),
      [
        "ZUVIX_GATEWAY_TOKEN=",
        "ZUVIX_GATEWAY_TOKEN=first-token",
        "ZUVIX_GATEWAY_TOKEN=last=token=value\r", // pragma: allowlist secret
      ].join("\n"),
    );
    const { result, envFile } = await runDockerSetupWithUnsetGatewayToken(
      activeSandbox,
      "dotenv-last-wins",
    );

    expect(result.status).toBe(0);
    expect(envFile).toContain("ZUVIX_GATEWAY_TOKEN=last=token=value"); // pragma: allowlist secret
    expect(envFile).not.toContain("ZUVIX_GATEWAY_TOKEN=first-token");
    expect(envFile).not.toContain("\r");
  });

  it("treats ZUVIX_SANDBOX=0 as disabled", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_SANDBOX: "0",
    });

    expect(result.status).toBe(0);
    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_SANDBOX=");

    const log = await readDockerLog(activeSandbox);
    expect(log).toContain("--build-arg ZUVIX_INSTALL_DOCKER_CLI=");
    expect(log).not.toContain("--build-arg ZUVIX_INSTALL_DOCKER_CLI=1");
    expect(log).toContain("config set agents.defaults.sandbox.mode off");
  });

  it("resets stale sandbox mode and overlay when sandbox is not active", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);
    await writeFile(
      join(activeSandbox.rootDir, "docker-compose.sandbox.yml"),
      "services:\n  zuvix-gateway:\n    volumes:\n      - /var/run/docker.sock:/var/run/docker.sock\n",
    );

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_SANDBOX: "1",
      DOCKER_STUB_FAIL_MATCH: "--entrypoint docker zuvix-gateway --version",
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("Sandbox requires Docker CLI");
    const log = await readDockerLog(activeSandbox);
    expect(log).toContain("config set agents.defaults.sandbox.mode off");
    await expectMissingPath(join(activeSandbox.rootDir, "docker-compose.sandbox.yml"));
  });

  it("skips sandbox gateway restart when sandbox config writes fail", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);
    const socketPath = join(activeSandbox.rootDir, "sandbox.sock");

    await withUnixSocket(socketPath, async () => {
      const result = runDockerSetup(activeSandbox, {
        ZUVIX_SANDBOX: "1",
        ZUVIX_DOCKER_SOCKET: socketPath,
        DOCKER_STUB_FAIL_MATCH: "config set agents.defaults.sandbox.scope",
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toContain("Failed to set agents.defaults.sandbox.scope");
      expect(result.stderr).toContain("Skipping gateway restart to avoid exposing Docker socket");

      const log = await readDockerLog(activeSandbox);
      const gatewayStarts = collectMatchingLines(await readDockerLogLines(activeSandbox), (line) =>
        isGatewayStartLine(line),
      );
      expect(gatewayStarts).toHaveLength(2);
      expect(log).toContain(
        "run --rm --no-deps zuvix-cli config set agents.defaults.sandbox.mode non-main",
      );
      expect(log).toContain("config set agents.defaults.sandbox.mode off");
      const forceRecreateLine = log
        .split("\n")
        .find((line) => line.includes("up -d --force-recreate zuvix-gateway"));
      expect(forceRecreateLine).toBe(
        `compose compose -f ${join(activeSandbox.rootDir, "docker-compose.yml")} up -d --force-recreate zuvix-gateway`,
      );
      expect(forceRecreateLine).not.toContain("docker-compose.sandbox.yml");
      await expectMissingPath(join(activeSandbox.rootDir, "docker-compose.sandbox.yml"));
    });
  });

  it("rejects injected multiline ZUVIX_EXTRA_MOUNTS values", () => {
    const activeSandbox = requireSandbox(sandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_EXTRA_MOUNTS: "/tmp:/tmp\n  evil-service:\n    image: alpine",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("ZUVIX_EXTRA_MOUNTS cannot contain control characters");
  });

  it("rejects invalid ZUVIX_EXTRA_MOUNTS mount format", () => {
    const activeSandbox = requireSandbox(sandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_EXTRA_MOUNTS: "bad mount spec",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Invalid mount format");
  });

  it("rejects invalid ZUVIX_HOME_VOLUME names", () => {
    const activeSandbox = requireSandbox(sandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_HOME_VOLUME: "bad name",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("ZUVIX_HOME_VOLUME must match");
  });

  it("rejects ZUVIX_TZ values that are not present in zoneinfo", () => {
    const activeSandbox = requireSandbox(sandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_TZ: "Nope/Bad",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("ZUVIX_TZ must match a timezone in /usr/share/zoneinfo");
  });

  it("skips onboarding when ZUVIX_SKIP_ONBOARDING is set", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_SKIP_ONBOARDING: "1",
    });

    expect(result.status).toBe(0);
    const log = await readDockerLog(activeSandbox);
    expect(log).not.toContain("onboard");
    // Gateway defaults (config set) and control UI allowlist should still run.
    expect(log).toContain("config set --batch-json");
    expect(log).toContain('"path":"gateway.mode","value":"local"');
    expect(log).toContain('"path":"gateway.bind","value":"lan"');
    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toContain("ZUVIX_SKIP_ONBOARDING=1");
  });

  it("treats ZUVIX_SKIP_ONBOARDING=0 as disabled and runs onboarding", async () => {
    const activeSandbox = requireSandbox(sandbox);
    await resetDockerLog(activeSandbox);

    const result = runDockerSetup(activeSandbox, {
      ZUVIX_SKIP_ONBOARDING: "0",
    });

    expect(result.status).toBe(0);
    const log = await readDockerLog(activeSandbox);
    expect(log).toContain(
      "onboard --mode local --no-install-daemon --gateway-auth token --gateway-token-ref-env ZUVIX_GATEWAY_TOKEN --skip-ui --suppress-gateway-token-output",
    );
    const envFile = await readFile(join(activeSandbox.rootDir, ".env"), "utf8");
    expect(envFile).toMatch(/ZUVIX_SKIP_ONBOARDING=\n/);
  });

  it("avoids associative arrays so the script remains Bash 3.2-compatible", async () => {
    const script = await readFile(join(repoRoot, "scripts", "docker", "setup.sh"), "utf8");
    expect(script).not.toMatch(/^\s*declare -A\b/m);

    const systemBash = resolveBashForCompatCheck();
    if (!systemBash) {
      return;
    }

    const assocCheck = spawnSync(systemBash, ["-c", "declare -A _t=()"], {
      encoding: "utf8",
    });
    if (assocCheck.status === 0 || assocCheck.status === null) {
      // Skip runtime check when system bash supports associative arrays
      // (not Bash 3.2) or when /bin/bash is unavailable (e.g. Windows).
      return;
    }

    const syntaxCheck = spawnSync(
      systemBash,
      ["-n", join(repoRoot, "scripts", "docker", "setup.sh")],
      {
        encoding: "utf8",
      },
    );

    expect(syntaxCheck.status).toBe(0);
    expect(syntaxCheck.stderr).not.toContain("declare: -A: invalid option");
  });

  it("keeps docker-compose gateway command in sync", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(compose).not.toContain("gateway-daemon");
    expect(compose).toContain('"gateway"');
  });

  it("keeps docker-compose gateway Bonjour advertising in auto mode by default", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(
      compose.match(/ZUVIX_DISABLE_BONJOUR: \$\{ZUVIX_DISABLE_BONJOUR:-\}/g),
    ).toHaveLength(1);
  });

  it("keeps docker-compose CLI network namespace settings in sync", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(compose).toContain('network_mode: "service:zuvix-gateway"');
    expect(compose).toContain("depends_on:\n      - zuvix-gateway");
  });

  it("keeps docker-compose gateway token env defaults aligned across services", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(compose.match(/ZUVIX_GATEWAY_TOKEN: \$\{ZUVIX_GATEWAY_TOKEN:-\}/g)).toHaveLength(
      2,
    );
  });

  it("keeps docker-compose auth profile secret key source durable outside state", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(
      compose.split(
        '"${ZUVIX_AUTH_PROFILE_SECRET_DIR:-${HOME:-/tmp}/.zuvix-auth-profile-secrets}:/home/node/.config/zuvix"',
      ),
    ).toHaveLength(3);
  });

  it("keeps docker-compose optional env files aligned across services", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(compose.match(/env_file:\n {6}- path: \.env\n {8}required: false/g)).toHaveLength(2);
  });

  it("keeps docker-compose timezone env defaults aligned across services", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(compose.match(/TZ: \$\{ZUVIX_TZ:-UTC\}/g)).toHaveLength(2);
  });

  it("pins container-side state, workspace, and config dirs on both services so host .env paths cannot leak (#77436)", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    // Both gateway and CLI services must override env_file values with the
    // canonical container paths so host-style paths written to `.env` cannot
    // reach runtime code inside Linux Docker.
    expect(compose.match(/ZUVIX_HOME: \/home\/node$/gm)).toHaveLength(2);
    expect(compose.match(/ZUVIX_STATE_DIR: \/home\/node\/\.zuvix$/gm)).toHaveLength(2);
    expect(
      compose.match(/ZUVIX_CONFIG_PATH: \/home\/node\/\.zuvix\/zuvix\.json$/gm),
    ).toHaveLength(2);
    expect(compose.match(/ZUVIX_CONFIG_DIR: \/home\/node\/\.zuvix$/gm)).toHaveLength(2);
    expect(
      compose.match(/ZUVIX_WORKSPACE_DIR: \/home\/node\/\.zuvix\/workspace$/gm),
    ).toHaveLength(2);
  });

  it("Dockerfile ARG ZUVIX_IMAGE_APT_PACKAGES must not have a default value", async () => {
    // If the ARG has a default (e.g. ARG ZUVIX_IMAGE_APT_PACKAGES=""), Docker treats it as
    // "set" even when no --build-arg is passed. That breaks the RUN fallback expression
    // ${ZUVIX_IMAGE_APT_PACKAGES-$ZUVIX_DOCKER_APT_PACKAGES} because the variable is
    // never truly unset, so legacy-only callers using --build-arg ZUVIX_DOCKER_APT_PACKAGES
    // get nothing installed — a backward-compat regression.
    const dockerfile = await readFile(join(repoRoot, "Dockerfile"), "utf8");
    const argLine = dockerfile
      .split("\n")
      .find((line) => line.startsWith("ARG ZUVIX_IMAGE_APT_PACKAGES"));
    expect(argLine).toBeDefined();
    // Must be bare `ARG ZUVIX_IMAGE_APT_PACKAGES` with no default assignment
    expect(argLine).toBe("ARG ZUVIX_IMAGE_APT_PACKAGES");
  });
});

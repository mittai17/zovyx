// Home environment test support isolates HOME-style paths for skill tests.
import os from "node:os";
import { vi } from "vitest";

/** Process home env snapshot used by skill loader tests. */
export type SkillsHomeEnvSnapshot = {
  previousHome: string | undefined;
  previousZuvixHome: string | undefined;
  previousUserProfile: string | undefined;
};

export function setMockSkillsHomeEnv(fakeHome: string): SkillsHomeEnvSnapshot {
  const snapshot: SkillsHomeEnvSnapshot = {
    previousHome: process.env.HOME,
    previousZuvixHome: process.env.ZUVIX_HOME,
    previousUserProfile: process.env.USERPROFILE,
  };
  process.env.HOME = fakeHome;
  delete process.env.ZUVIX_HOME;
  delete process.env.USERPROFILE;
  vi.spyOn(os, "homedir").mockReturnValue(fakeHome);
  return snapshot;
}

export async function restoreMockSkillsHomeEnv(
  snapshot: SkillsHomeEnvSnapshot,
  cleanup?: () => Promise<void> | void,
) {
  vi.restoreAllMocks();
  if (snapshot.previousHome === undefined) {
    delete process.env.HOME;
  } else {
    process.env.HOME = snapshot.previousHome;
  }
  if (snapshot.previousZuvixHome === undefined) {
    delete process.env.ZUVIX_HOME;
  } else {
    process.env.ZUVIX_HOME = snapshot.previousZuvixHome;
  }
  if (snapshot.previousUserProfile === undefined) {
    delete process.env.USERPROFILE;
  } else {
    process.env.USERPROFILE = snapshot.previousUserProfile;
  }
  await cleanup?.();
}

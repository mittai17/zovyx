// Zuvix root resolution imports fs through this facade so tests can replace
// filesystem behavior without mocking node:fs globally.
export { default as zuvixRootFsSync } from "node:fs";
export { default as zuvixRootFs } from "node:fs/promises";

#!/usr/bin/env node
/**
 * Runs `prisma generate` after install, but never breaks `npm install` when the
 * environment cannot reach the Prisma engine CDN (offline sandbox, air-gapped CI).
 * The build command runs `prisma generate` again, so the client is always produced
 * on Vercel even if this step was skipped.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  console.warn("\n[farga] prisma generate could not run now (offline?). The build step will retry it.\n");
}
process.exit(0);

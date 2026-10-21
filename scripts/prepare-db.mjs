#!/usr/bin/env node
/**
 * Fully automatic database preparation for Vercel (and any host).
 *
 * - If DATABASE_URL exists -> `prisma db push` creates/synchronises every table
 *   from prisma/schema.prisma (no migration files, no interactive prompts).
 * - If DATABASE_URL is missing -> the build continues so that a preview/demo can
 *   still be deployed. The app then uses its local file store instead of Postgres.
 */
import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.warn("\n[farja] DATABASE_URL is not set — skipping `prisma db push`.");
  console.warn("[farja] The app will run in demo mode with a local JSON store until a database is connected.\n");
  process.exit(0);
}

console.log("[farja] Synchronising the PostgreSQL schema with Prisma…");
const result = spawnSync(
  "npx",
  ["prisma", "db", "push", "--accept-data-loss", "--skip-generate"],
  { stdio: "inherit", env: process.env, shell: process.platform === "win32" },
);

if (result.status !== 0) {
  console.error("\n[farja] `prisma db push` failed. Check DATABASE_URL (Neon/Supabase/Vercel Postgres) and SSL settings.");
  console.error("[farja] The build is stopped so production never runs against an un-migrated database.\n");
  process.exit(result.status ?? 1);
}

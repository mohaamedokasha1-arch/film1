import "server-only";
import path from "node:path";
import { cache } from "react";
import { hash } from "bcryptjs";
import { siteConfig } from "@/config/site";
import type { AdminStats, PublicUser } from "@/types";
import type { DataStore } from "./types";

export type { DataStore } from "./types";
export { FileStore } from "./file-store";

let storePromise: Promise<DataStore> | null = null;
let seedPromise: Promise<void> | null = null;

export function isDatabaseConfigured() {
  return Boolean((process.env.DATABASE_URL || "").trim());
}

async function createStore(): Promise<DataStore> {
  if (isDatabaseConfigured()) {
    try {
      const { PrismaStore } = await import("./prisma-store");
      return new PrismaStore();
    } catch (error) {
      console.error("[farja] Could not start the Prisma store, falling back to the file store.", error);
    }
  }
  const { FileStore } = await import("./file-store");
  return new FileStore();
}

export async function getStore(): Promise<DataStore> {
  if (!storePromise) storePromise = createStore();
  return storePromise;
}

/**
 * Automatic, non-interactive seeding:
 *  - creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD (or the defaults)
 *  - promotes an existing matching user to ADMIN
 *  - writes the default site settings once
 * Runs lazily on the first auth/page request, never during the build.
 */
export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seed().catch((error) => {
      console.error("[farja] Seeding failed (the site keeps working):", error);
      seedPromise = null;
    });
  }
  return seedPromise;
}

async function seed(): Promise<void> {
  const store = await getStore();
  const email = (process.env.ADMIN_EMAIL || siteConfig.adminEmailDefault).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || siteConfig.adminPasswordDefault;

  const existing = await store.findUserByEmail(email);
  if (!existing) {
    await store.createUser({
      name: "Farja Admin",
      email,
      passwordHash: await hash(password, 10),
      role: "ADMIN",
    });
    await store.setSetting("admin.defaultPassword", process.env.ADMIN_PASSWORD ? "0" : "1");
  } else if (existing.role !== "ADMIN") {
    await store.updateUser(existing.id, { role: "ADMIN" });
  }

  const settings = await store.getSettings();
  if (!settings["site.tagline"]) await store.setSetting("site.tagline", siteConfig.tagline.ar);
  if (settings["site.announcement"] === undefined) await store.setSetting("site.announcement", "");
}

export const getSiteSettings = cache(async () => {
  try {
    const store = await getStore();
    const settings = await store.getSettings();
    return {
      tagline: settings["site.tagline"] || siteConfig.tagline.ar,
      announcement: settings["site.announcement"] || "",
      defaultPassword: settings["admin.defaultPassword"] !== "0",
    };
  } catch {
    return { tagline: siteConfig.tagline.ar, announcement: "", defaultPassword: true };
  }
});

export async function getAdminOverview(): Promise<{ stats: AdminStats; users: PublicUser[] }> {
  const store = await getStore();
  const [stats, users] = await Promise.all([store.stats(), store.listUsers()]);
  return { stats, users };
}

export function databaseLabel() {
  return isDatabaseConfigured() ? "PostgreSQL" : "local-file";
}

export function dataDir() {
  return process.env.FARJA_DATA_DIR || path.join(process.cwd(), ".data");
}

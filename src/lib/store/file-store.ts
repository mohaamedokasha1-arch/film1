import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import type {
  AdminStats,
  HistoryRecord,
  MediaType,
  PublicUser,
  UserRecord,
  WatchlistRecord,
} from "@/types";
import type { DataStore, HistoryInput, NewUser, WatchlistInput } from "./types";

interface FileData {
  users: UserRecord[];
  watchlist: (WatchlistRecord & { userId: string })[];
  history: (HistoryRecord & { userId: string })[];
  settings: Record<string, string>;
}

/**
 * File-backed store used only when DATABASE_URL is missing (local preview / demo).
 * It keeps accounts and lists inside a JSON file so the preview is fully usable.
 * On production with PostgreSQL, the Prisma store is used instead.
 */
export class FileStore implements DataStore {
  mode = "file" as const;
  private file: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor() {
    const base = process.env.FARJA_DATA_DIR
      ? process.env.FARJA_DATA_DIR
      : process.env.VERCEL
        ? path.join(os.tmpdir(), "farja-data")
        : path.join(process.cwd(), ".data");
    this.file = path.join(base, "store.json");
  }

  private async read(): Promise<FileData> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      const parsed = JSON.parse(raw) as Partial<FileData>;
      return {
        users: parsed.users ?? [],
        watchlist: parsed.watchlist ?? [],
        history: parsed.history ?? [],
        settings: parsed.settings ?? {},
      };
    } catch {
      return { users: [], watchlist: [], history: [], settings: {} };
    }
  }

  private async write(data: FileData) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const temp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(temp, this.file);
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.queue.then(operation, operation);
    this.queue = next.catch(() => undefined);
    return next;
  }

  private toPublic(user: UserRecord): PublicUser {
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  async findUserByEmail(email: string) {
    const data = await this.read();
    return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findUserById(id: string) {
    const data = await this.read();
    return data.users.find((user) => user.id === id) ?? null;
  }

  async createUser(input: NewUser) {
    return this.enqueue(async () => {
      const data = await this.read();
      if (data.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
        throw new Error("EMAIL_TAKEN");
      }
      const user: UserRecord = {
        id: randomUUID(),
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        role: input.role ?? "USER",
        createdAt: new Date().toISOString(),
      };
      data.users.push(user);
      await this.write(data);
      return user;
    });
  }

  async updateUser(id: string, patch: Partial<Pick<UserRecord, "name" | "email" | "passwordHash" | "role">>) {
    return this.enqueue(async () => {
      const data = await this.read();
      const user = data.users.find((entry) => entry.id === id);
      if (!user) return null;
      if (patch.email && data.users.some((entry) => entry.id !== id && entry.email.toLowerCase() === patch.email!.toLowerCase())) {
        throw new Error("EMAIL_TAKEN");
      }
      Object.assign(user, patch);
      await this.write(data);
      return user;
    });
  }

  async deleteUser(id: string) {
    await this.enqueue(async () => {
      const data = await this.read();
      data.users = data.users.filter((user) => user.id !== id);
      data.watchlist = data.watchlist.filter((item) => item.userId !== id);
      data.history = data.history.filter((item) => item.userId !== id);
      await this.write(data);
    });
  }

  async listUsers() {
    const data = await this.read();
    return [...data.users]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((user) => this.toPublic(user));
  }

  async countUsers() {
    const data = await this.read();
    return {
      total: data.users.length,
      admins: data.users.filter((user) => user.role === "ADMIN").length,
    };
  }

  async getWatchlist(userId: string) {
    const data = await this.read();
    return data.watchlist
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ userId: _ignored, ...item }) => item);
  }

  async isInWatchlist(userId: string, tmdbId: number, mediaType: MediaType) {
    const data = await this.read();
    return data.watchlist.some(
      (item) => item.userId === userId && item.tmdbId === tmdbId && item.mediaType === mediaType,
    );
  }

  async addToWatchlist(userId: string, input: WatchlistInput) {
    return this.enqueue(async () => {
      const data = await this.read();
      const existing = data.watchlist.find(
        (item) => item.userId === userId && item.tmdbId === input.tmdbId && item.mediaType === input.mediaType,
      );
      if (existing) return existing;
      const item = {
        id: randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        ...input,
      };
      data.watchlist.push(item);
      await this.write(data);
      const { userId: _ignored, ...rest } = item;
      return rest;
    });
  }

  async removeFromWatchlist(userId: string, tmdbId: number, mediaType: MediaType) {
    await this.enqueue(async () => {
      const data = await this.read();
      data.watchlist = data.watchlist.filter(
        (item) => !(item.userId === userId && item.tmdbId === tmdbId && item.mediaType === mediaType),
      );
      await this.write(data);
    });
  }

  async getHistory(userId: string, limit = 50) {
    const data = await this.read();
    return data.history
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.lastWatchedAt.localeCompare(a.lastWatchedAt))
      .slice(0, limit)
      .map(({ userId: _ignored, ...item }) => item);
  }

  async upsertHistory(userId: string, input: HistoryInput) {
    return this.enqueue(async () => {
      const data = await this.read();
      const index = data.history.findIndex(
        (item) => item.userId === userId && item.tmdbId === input.tmdbId && item.mediaType === input.mediaType,
      );
      const record = {
        id: index >= 0 ? data.history[index].id : randomUUID(),
        userId,
        ...input,
        lastWatchedAt: new Date().toISOString(),
      };
      if (index >= 0) data.history[index] = record;
      else data.history.push(record);
      await this.write(data);
      const { userId: _ignored, ...rest } = record;
      return rest;
    });
  }

  async removeHistory(userId: string, tmdbId: number, mediaType: MediaType) {
    await this.enqueue(async () => {
      const data = await this.read();
      data.history = data.history.filter(
        (item) => !(item.userId === userId && item.tmdbId === tmdbId && item.mediaType === mediaType),
      );
      await this.write(data);
    });
  }

  async getSettings() {
    const data = await this.read();
    return data.settings;
  }

  async setSetting(key: string, value: string) {
    await this.enqueue(async () => {
      const data = await this.read();
      data.settings[key] = value;
      await this.write(data);
    });
  }

  async stats(): Promise<AdminStats> {
    const data = await this.read();
    return {
      totalUsers: data.users.length,
      totalAdmins: data.users.filter((user) => user.role === "ADMIN").length,
      watchlistItems: data.watchlist.length,
      historyItems: data.history.length,
      source: "catalog",
      database: false,
    };
  }
}

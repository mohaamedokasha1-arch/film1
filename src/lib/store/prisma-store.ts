import "server-only";
import { PrismaClient, type Prisma } from "@prisma/client";
import type {
  AdminStats,
  HistoryRecord,
  MediaType,
  PublicUser,
  UserRecord,
  WatchlistRecord,
} from "@/types";
import type { DataStore, HistoryInput, NewUser, WatchlistInput } from "./types";
import { hasTmdbCredentials } from "@/lib/tmdb";

const globalForPrisma = globalThis as unknown as { farjaPrisma?: PrismaClient };

function client(): PrismaClient {
  if (!globalForPrisma.farjaPrisma) {
    globalForPrisma.farjaPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.farjaPrisma;
}

type DbUser = {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
};

const toUser = (user: DbUser): UserRecord => ({
  id: user.id,
  name: user.name,
  email: user.email,
  passwordHash: user.passwordHash,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
});

const toPublic = (user: DbUser): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
});

const isUniqueError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";

export class PrismaStore implements DataStore {
  mode = "prisma" as const;

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const user = await client().user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? toUser(user) : null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const user = await client().user.findUnique({ where: { id } });
    return user ? toUser(user) : null;
  }

  async createUser(input: NewUser): Promise<UserRecord> {
    try {
      const user = await client().user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash: input.passwordHash,
          role: input.role ?? "USER",
        },
      });
      return toUser(user);
    } catch (error) {
      if (isUniqueError(error)) throw new Error("EMAIL_TAKEN");
      throw error;
    }
  }

  async updateUser(
    id: string,
    patch: Partial<Pick<UserRecord, "name" | "email" | "passwordHash" | "role">>,
  ): Promise<UserRecord | null> {
    try {
      const data: Prisma.UserUpdateInput = {};
      if (patch.name !== undefined) data.name = patch.name;
      if (patch.email !== undefined) data.email = patch.email.toLowerCase();
      if (patch.passwordHash !== undefined) data.passwordHash = patch.passwordHash;
      if (patch.role !== undefined) data.role = patch.role;
      const user = await client().user.update({ where: { id }, data });
      return toUser(user);
    } catch (error) {
      if (isUniqueError(error)) throw new Error("EMAIL_TAKEN");
      return null;
    }
  }

  async deleteUser(id: string): Promise<void> {
    await client().user.delete({ where: { id } }).catch(() => undefined);
  }

  async listUsers(): Promise<PublicUser[]> {
    const users = await client().user.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return users.map(toPublic);
  }

  async countUsers() {
    const [total, admins] = await Promise.all([
      client().user.count(),
      client().user.count({ where: { role: "ADMIN" } }),
    ]);
    return { total, admins };
  }

  async getWatchlist(userId: string): Promise<WatchlistRecord[]> {
    const items = await client().watchlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return items.map((item) => ({
      id: item.id,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType as MediaType,
      title: item.title,
      posterPath: item.posterPath,
      rating: item.rating,
      releaseDate: item.releaseDate,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async isInWatchlist(userId: string, tmdbId: number, mediaType: MediaType): Promise<boolean> {
    const item = await client().watchlistItem.findUnique({
      where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } },
    });
    return Boolean(item);
  }

  async addToWatchlist(userId: string, input: WatchlistInput): Promise<WatchlistRecord> {
    const item = await client().watchlistItem.upsert({
      where: { userId_tmdbId_mediaType: { userId, tmdbId: input.tmdbId, mediaType: input.mediaType } },
      update: {},
      create: {
        userId,
        tmdbId: input.tmdbId,
        mediaType: input.mediaType,
        title: input.title,
        posterPath: input.posterPath,
        rating: input.rating,
        releaseDate: input.releaseDate,
      },
    });
    return {
      id: item.id,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType as MediaType,
      title: item.title,
      posterPath: item.posterPath,
      rating: item.rating,
      releaseDate: item.releaseDate,
      createdAt: item.createdAt.toISOString(),
    };
  }

  async removeFromWatchlist(userId: string, tmdbId: number, mediaType: MediaType): Promise<void> {
    await client().watchlistItem
      .delete({ where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } } })
      .catch(() => undefined);
  }

  async getHistory(userId: string, limit = 50): Promise<HistoryRecord[]> {
    const items = await client().watchHistory.findMany({
      where: { userId },
      orderBy: { lastWatchedAt: "desc" },
      take: limit,
    });
    return items.map((item) => ({
      id: item.id,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType as MediaType,
      title: item.title,
      posterPath: item.posterPath,
      season: item.season,
      episode: item.episode,
      progress: item.progress,
      duration: item.duration,
      lastWatchedAt: item.lastWatchedAt.toISOString(),
    }));
  }

  async upsertHistory(userId: string, input: HistoryInput): Promise<HistoryRecord> {
    const item = await client().watchHistory.upsert({
      where: { userId_tmdbId_mediaType: { userId, tmdbId: input.tmdbId, mediaType: input.mediaType } },
      update: {
        title: input.title,
        posterPath: input.posterPath,
        season: input.season,
        episode: input.episode,
        progress: input.progress,
        duration: input.duration,
        lastWatchedAt: new Date(),
      },
      create: {
        userId,
        tmdbId: input.tmdbId,
        mediaType: input.mediaType,
        title: input.title,
        posterPath: input.posterPath,
        season: input.season,
        episode: input.episode,
        progress: input.progress,
        duration: input.duration,
      },
    });
    return {
      id: item.id,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType as MediaType,
      title: item.title,
      posterPath: item.posterPath,
      season: item.season,
      episode: item.episode,
      progress: item.progress,
      duration: item.duration,
      lastWatchedAt: item.lastWatchedAt.toISOString(),
    };
  }

  async removeHistory(userId: string, tmdbId: number, mediaType: MediaType): Promise<void> {
    await client().watchHistory
      .delete({ where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } } })
      .catch(() => undefined);
  }

  async getSettings(): Promise<Record<string, string>> {
    const rows = await client().setting.findMany();
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  async setSetting(key: string, value: string): Promise<void> {
    await client().setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  async stats(): Promise<AdminStats> {
    const [totalUsers, totalAdmins, watchlistItems, historyItems] = await Promise.all([
      client().user.count(),
      client().user.count({ where: { role: "ADMIN" } }),
      client().watchlistItem.count(),
      client().watchHistory.count(),
    ]);
    return {
      totalUsers,
      totalAdmins,
      watchlistItems,
      historyItems,
      source: hasTmdbCredentials() ? "tmdb" : "catalog",
      database: true,
    };
  }
}

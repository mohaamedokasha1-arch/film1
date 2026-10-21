import type {
  AdminStats,
  CustomTitleInput,
  CustomTitleRecord,
  HistoryRecord,
  MediaType,
  PublicUser,
  StreamSourceInput,
  StreamSourceRecord,
  UserRecord,
  UserRole,
  WatchlistRecord,
} from "@/types";

export interface NewUser {
  name: string | null;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface WatchlistInput {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  rating: number | null;
  releaseDate: string | null;
}

export interface HistoryInput {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  season: number | null;
  episode: number | null;
  progress: number;
  duration: number | null;
}

export interface DataStore {
  mode: "prisma" | "file";
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(input: NewUser): Promise<UserRecord>;
  updateUser(
    id: string,
    patch: Partial<Pick<UserRecord, "name" | "email" | "passwordHash" | "role">>,
  ): Promise<UserRecord | null>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<PublicUser[]>;
  countUsers(): Promise<{ total: number; admins: number }>;
  getWatchlist(userId: string): Promise<WatchlistRecord[]>;
  isInWatchlist(userId: string, tmdbId: number, mediaType: MediaType): Promise<boolean>;
  addToWatchlist(userId: string, input: WatchlistInput): Promise<WatchlistRecord>;
  removeFromWatchlist(userId: string, tmdbId: number, mediaType: MediaType): Promise<void>;
  getHistory(userId: string, limit?: number): Promise<HistoryRecord[]>;
  upsertHistory(userId: string, input: HistoryInput): Promise<HistoryRecord>;
  removeHistory(userId: string, tmdbId: number, mediaType: MediaType): Promise<void>;
  getSettings(): Promise<Record<string, string>>;
  setSetting(key: string, value: string): Promise<void>;
  stats(): Promise<AdminStats>;

  /* --- Admin-managed content (custom titles + playback links) --- */
  listCustomTitles(options?: { publishedOnly?: boolean }): Promise<CustomTitleRecord[]>;
  findCustomTitle(id: string): Promise<CustomTitleRecord | null>;
  findCustomTitleByNumericId(numericId: number): Promise<CustomTitleRecord | null>;
  createCustomTitle(input: CustomTitleInput): Promise<CustomTitleRecord>;
  updateCustomTitle(id: string, patch: Partial<CustomTitleInput>): Promise<CustomTitleRecord | null>;
  deleteCustomTitle(id: string): Promise<void>;

  listStreamSources(filter?: { mediaType?: MediaType; tmdbId?: number }): Promise<StreamSourceRecord[]>;
  addStreamSource(input: StreamSourceInput): Promise<StreamSourceRecord>;
  removeStreamSource(id: string): Promise<void>;
}

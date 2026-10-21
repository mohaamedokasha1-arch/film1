import type {
  CustomStream,
  CustomTitleInput,
  CustomTitleRecord,
  MediaType,
  StreamSourceInput,
  StreamSourceRecord,
} from "@/types";

/**
 * Titles created from the dashboard use numeric ids in a reserved range so they
 * can never collide with a real TMDB id (TMDB ids stay far below 9,000,000).
 */
export const CUSTOM_ID_BASE = 9_000_000;

/** Raw shape persisted by both backends (Prisma row / JSON file entry). */
export interface CustomTitleRow {
  id: string;
  numericId: number;
  type: string;
  titleAr: string;
  titleEn: string;
  overviewAr: string;
  overviewEn: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  year: number | null;
  rating: number | null;
  runtime: number | null;
  genres: string;
  castNames: string;
  seasons: number | null;
  episodes: number | null;
  streams: string;
  published: boolean;
  featured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StreamSourceRow {
  id: string;
  mediaType: string;
  tmdbId: number;
  label: string;
  url: string;
  quality: string | null;
  createdAt: Date | string;
}

const QUALITIES = new Set(["HD", "FHD", "4K"]);

export function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "tv";
}

/** Trims a comma separated field into a clean list. */
export function splitList(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function joinList(values: string[] | undefined, max = 40): string {
  if (!values) return "";
  const unique = Array.from(new Set(values.map((value) => String(value).trim()).filter(Boolean)));
  return unique.slice(0, max).join(", ");
}

/**
 * Accepts a URL only when it is absolute http(s) — protects the iframe from
 * javascript: URLs. The original string is kept (not re-serialised) so that
 * `{season}` / `{episode}` placeholders survive instead of becoming %7B…%7D.
 */
export function safeUrl(value: unknown): string | null {
  const raw = String(value ?? "")
    .trim()
    // Strip control characters that could break out of an attribute.
    .replace(/[\u0000-\u001f\u007f]/g, "");
  if (!raw) return null;
  const candidate = raw.startsWith("//") ? `https:${raw}` : raw;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return candidate;
  } catch {
    return null;
  }
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Server";
  }
}

export function normalizeStreams(value: unknown): CustomStream[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const streams: CustomStream[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const url = safeUrl(record.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const qualityRaw = String(record.quality ?? "").toUpperCase();
    const label = String(record.label ?? "").trim().slice(0, 40) || hostLabel(url);
    streams.push({
      label,
      url,
      quality: QUALITIES.has(qualityRaw) ? qualityRaw : null,
    });
  }
  return streams.slice(0, 20);
}

export function parseStreams(raw: string | null | undefined): CustomStream[] {
  if (!raw) return [];
  try {
    return normalizeStreams(JSON.parse(raw));
  } catch {
    return [];
  }
}

function numberOrNull(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function rowToCustomTitle(row: CustomTitleRow): CustomTitleRecord {
  return {
    id: row.id,
    numericId: row.numericId,
    type: isMediaType(row.type) ? row.type : "movie",
    titleAr: row.titleAr,
    titleEn: row.titleEn,
    overviewAr: row.overviewAr,
    overviewEn: row.overviewEn,
    posterUrl: row.posterUrl,
    backdropUrl: row.backdropUrl,
    trailerUrl: row.trailerUrl,
    year: row.year,
    rating: row.rating,
    runtime: row.runtime,
    genres: splitList(row.genres),
    cast: splitList(row.castNames),
    seasons: row.seasons,
    episodes: row.episodes,
    streams: parseStreams(row.streams),
    published: row.published,
    featured: row.featured,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export function rowToStreamSource(row: StreamSourceRow): StreamSourceRecord {
  return {
    id: row.id,
    mediaType: isMediaType(row.mediaType) ? row.mediaType : "movie",
    tmdbId: row.tmdbId,
    label: row.label,
    url: row.url,
    quality: row.quality,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

/** Validates and flattens admin input into the persisted column values. */
export function normalizeCustomFields(input: CustomTitleInput, current?: CustomTitleRow) {
  const titleAr = String(input.titleAr ?? current?.titleAr ?? "").trim().slice(0, 200);
  const titleEn = String(input.titleEn ?? current?.titleEn ?? "").trim().slice(0, 200);
  const streams = input.streams === undefined ? parseStreams(current?.streams) : normalizeStreams(input.streams);

  return {
    type: isMediaType(input.type) ? input.type : (current?.type as MediaType) ?? "movie",
    titleAr,
    titleEn,
    overviewAr: String(input.overviewAr ?? current?.overviewAr ?? "").trim().slice(0, 4000),
    overviewEn: String(input.overviewEn ?? current?.overviewEn ?? "").trim().slice(0, 4000),
    posterUrl: input.posterUrl === undefined ? (current?.posterUrl ?? null) : safeUrl(input.posterUrl),
    backdropUrl: input.backdropUrl === undefined ? (current?.backdropUrl ?? null) : safeUrl(input.backdropUrl),
    trailerUrl: input.trailerUrl === undefined ? (current?.trailerUrl ?? null) : safeUrl(input.trailerUrl),
    year: input.year === undefined ? (current?.year ?? null) : numberOrNull(input.year, 1888, 2100),
    rating: input.rating === undefined ? (current?.rating ?? null) : numberOrNull(input.rating, 0, 10),
    runtime: input.runtime === undefined ? (current?.runtime ?? null) : numberOrNull(input.runtime, 1, 1200),
    genres: input.genres === undefined ? (current?.genres ?? "") : joinList(input.genres),
    castNames: input.cast === undefined ? (current?.castNames ?? "") : joinList(input.cast),
    seasons: input.seasons === undefined ? (current?.seasons ?? null) : numberOrNull(input.seasons, 1, 100),
    episodes: input.episodes === undefined ? (current?.episodes ?? null) : numberOrNull(input.episodes, 1, 5000),
    streams: JSON.stringify(streams),
    published: input.published ?? current?.published ?? true,
    featured: input.featured ?? current?.featured ?? false,
  };
}

/** Filters admin input down to something valid before it reaches the store. */
export function validateCustomInput(input: CustomTitleInput): string | null {
  if (!isMediaType(input.type)) return "invalid_type";
  const titleAr = String(input.titleAr ?? "").trim();
  const titleEn = String(input.titleEn ?? "").trim();
  if (titleAr.length < 1 && titleEn.length < 1) return "title_required";
  if (titleAr.length > 200 || titleEn.length > 200) return "title_too_long";
  const streams = normalizeStreams(input.streams ?? []);
  if (streams.length === 0) return "stream_required";
  return null;
}

export function normalizeStreamInput(input: StreamSourceInput): { error?: string; value?: StreamSourceInput } {
  const mediaType = isMediaType(input.mediaType) ? input.mediaType : null;
  const tmdbId = Number(input.tmdbId);
  const url = safeUrl(input.url);
  const label = String(input.label ?? "").trim().slice(0, 40);
  if (!mediaType) return { error: "invalid_type" };
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) return { error: "invalid_tmdb_id" };
  if (!url) return { error: "invalid_url" };
  const qualityRaw = String(input.quality ?? "").toUpperCase();
  return {
    value: {
      mediaType,
      tmdbId,
      label: label || hostLabel(url),
      url,
      quality: QUALITIES.has(qualityRaw) ? qualityRaw : null,
    },
  };
}

/** Next free numeric id (>= base) for a new custom title. */
export function nextNumericId(existing: number[]): number {
  const highest = existing.reduce((max, value) => (Number.isFinite(value) && value > max ? value : max), CUSTOM_ID_BASE);
  return Math.max(CUSTOM_ID_BASE, highest) + 1;
}

import "server-only";
import { cache } from "react";
import type { CustomStream, CustomTitleRecord, MediaType, SeasonInfo, Title } from "@/types";
import { CUSTOM_ID_BASE } from "@/lib/store/custom-helpers";
import { genreBySlug } from "@/config/genres";
import { getStore } from "@/lib/store";
import { fillStreamTemplate } from "@/lib/streams";

export { CUSTOM_ID_BASE };

/** True when an id belongs to a dashboard-created title instead of TMDB. */
export function isCustomId(id: number) {
  return Number.isInteger(id) && id >= CUSTOM_ID_BASE;
}

function youtubeKey(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1).split("/")[0] || null;
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).pop() ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function buildSeasonList(record: CustomTitleRecord): SeasonInfo[] {
  if (record.type !== "tv") return [];
  const seasons = Math.min(Math.max(record.seasons ?? 1, 1), 40);
  const perSeason = Math.min(Math.max(record.episodes ?? 1, 1), 500);
  return Array.from({ length: seasons }, (_, index) => ({
    season: index + 1,
    name: null,
    episodeCount: perSeason,
    airDate: null,
    posterPath: null,
    overview: null,
  }));
}

/** Maps a dashboard record to the same `Title` shape used by TMDB/catalog data. */
export function customToTitle(record: CustomTitleRecord, locale: string): Title {
  const ar = locale === "ar";
  const primary = ar ? record.titleAr || record.titleEn : record.titleEn || record.titleAr;
  const secondary = ar ? record.titleEn || record.titleAr : record.titleAr || record.titleEn;
  const genreSlugs = record.genres.filter((slug) => genreBySlug.has(slug));
  const genreNames = genreSlugs.map((slug) => {
    const genre = genreBySlug.get(slug)!;
    return ar ? genre.ar : genre.en;
  });
  const seasonList = buildSeasonList(record);
  const episodes = seasonList.reduce((total, season) => total + season.episodeCount, 0);

  return {
    id: record.numericId,
    type: record.type,
    title: primary || secondary,
    originalTitle: secondary || primary,
    overview: ar ? record.overviewAr || record.overviewEn : record.overviewEn || record.overviewAr,
    tagline: null,
    posterPath: record.posterUrl,
    backdropPath: record.backdropUrl ?? record.posterUrl,
    releaseDate: record.year ? `${record.year}-01-01` : null,
    rating: record.rating ?? 0,
    voteCount: 0,
    popularity: 1000 + (record.featured ? 500 : 0) + (record.numericId % 100),
    genres: genreNames,
    genreSlugs,
    runtime: record.runtime,
    seasons: record.type === "tv" ? Math.max(record.seasons ?? 1, 1) : null,
    episodes: record.type === "tv" ? Math.max(episodes, 1) : null,
    originalLanguage: /[\u0600-\u06FF]/.test(record.titleAr) ? "ar" : "en",
    status: "Released",
    creators: [],
    cast: record.cast.map((name) => ({ name, character: null, profilePath: null })),
    trailerKey: youtubeKey(record.trailerUrl),
    seasonList,
    adult: false,
  };
}

/** Published dashboard titles, in insertion order (newest first). Cached per request. */
export const getPublishedCustomTitles = cache(async (): Promise<CustomTitleRecord[]> => {
  try {
    const store = await getStore();
    return await store.listCustomTitles({ publishedOnly: true });
  } catch (error) {
    console.error("[farja] Could not load dashboard titles:", error);
    return [];
  }
});

/** Every dashboard title, including drafts — admin screens only. */
export async function listAllCustomTitles(): Promise<CustomTitleRecord[]> {
  try {
    const store = await getStore();
    return await store.listCustomTitles();
  } catch (error) {
    console.error("[farja] Could not load dashboard titles:", error);
    return [];
  }
}

export const getCustomTitleRecord = cache(async (numericId: number): Promise<CustomTitleRecord | null> => {
  if (!isCustomId(numericId)) return null;
  try {
    const store = await getStore();
    return await store.findCustomTitleByNumericId(numericId);
  } catch (error) {
    console.error("[farja] Could not load dashboard title:", error);
    return null;
  }
});

/** Published titles only — used by public pages. */
export async function getCustomTitle(numericId: number, type: MediaType, locale: string) {
  const record = await getCustomTitleRecord(numericId);
  if (!record || !record.published || record.type !== type) return null;
  return customToTitle(record, locale);
}

export async function getCustomRelated(record: CustomTitleRecord, locale: string, limit = 12): Promise<Title[]> {
  const all = await getPublishedCustomTitles();
  return all
    .filter((entry) => entry.numericId !== record.numericId)
    .sort((a, b) => {
      const aShared = a.genres.filter((genre) => record.genres.includes(genre)).length;
      const bShared = b.genres.filter((genre) => record.genres.includes(genre)).length;
      return bShared - aShared || Number(b.type === record.type) - Number(a.type === record.type);
    })
    .slice(0, limit)
    .map((entry) => customToTitle(entry, locale));
}

export { fillStreamTemplate };

/** Admin links for a real TMDB title (used by the watch page). */
export const getStreamOverrides = cache(
  async (mediaType: MediaType, tmdbId: number): Promise<CustomStream[]> => {
    try {
      const store = await getStore();
      const rows = await store.listStreamSources({ mediaType, tmdbId });
      return rows.map((row) => ({ label: row.label, url: row.url, quality: row.quality }));
    } catch (error) {
      console.error("[farja] Could not load stream overrides:", error);
      return [];
    }
  },
);

export async function listStreamSources(mediaType?: MediaType, tmdbId?: number) {
  try {
    const store = await getStore();
    return await store.listStreamSources({ mediaType, tmdbId });
  } catch (error) {
    console.error("[farja] Could not load stream sources:", error);
    return [];
  }
}

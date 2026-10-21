import "server-only";
import { cache } from "react";
import type {
  BrowseFilters,
  CustomTitleRecord,
  DataSource,
  EpisodeInfo,
  MediaType,
  Paginated,
  Title,
} from "@/types";
import { firstParam, paginate } from "@/lib/utils";
import { genreBySlug } from "@/config/genres";
import { siteConfig } from "@/config/site";
import {
  catalogSearchSuggestions,
  catalogTitles,
  catalogYears,
  browseCatalog,
  collectionCatalog,
  findCatalogTitle,
  getCatalogStats,
  similarCatalog,
  trendingCatalog,
} from "@/lib/catalog";
import {
  customToTitle,
  getCustomRelated,
  getCustomTitle,
  getCustomTitleRecord,
  getPublishedCustomTitles,
  isCustomId,
} from "@/lib/custom";
import {
  hasTmdbCredentials,
  tmdbDetails,
  tmdbDiscover,
  tmdbList,
  tmdbSearch,
  tmdbSeasonEpisodes,
  tmdbSuggestions,
  tmdbTrending,
} from "@/lib/tmdb";

const warned = new Set<string>();

function warnOnce(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[farja] ${message}`);
}

async function tryLive<T>(operation: () => Promise<T>, description: string): Promise<T | null> {
  if (!hasTmdbCredentials()) return null;
  try {
    return await operation();
  } catch (error) {
    warnOnce(`${description} failed (${error instanceof Error ? error.message : "unknown error"}). Falling back to the bundled catalog.`);
    return null;
  }
}

export function isLiveSource() {
  return hasTmdbCredentials();
}

export function currentDataSource(): DataSource {
  return hasTmdbCredentials() ? "tmdb" : "catalog";
}

export function platformStats() {
  const catalogStats = getCatalogStats();
  return {
    titles: catalogStats.titles,
    genres: catalogStats.genres,
    servers: siteConfig.stats.servers,
    languages: siteConfig.stats.languages,
  };
}

function mergePaginated(
  pages: Paginated<Title>[],
  page: number,
  pageSize: number,
  sortBy: BrowseFilters["sort"] = "popularity",
): Paginated<Title> {
  const seen = new Set<string>();
  const combined = pages
    .flatMap((entry) => entry.items)
    .filter((item) => {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  combined.sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating || b.voteCount - a.voteCount;
    if (sortBy === "newest") return (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");
    if (sortBy === "oldest") return (a.releaseDate ?? "9999").localeCompare(b.releaseDate ?? "9999");
    return b.popularity - a.popularity;
  });

  const sliced = paginate(combined, page, pageSize);
  return {
    ...sliced,
    totalPages: Math.max(...pages.map((entry) => entry.totalPages), 1),
    totalResults: pages.reduce((total, entry) => total + entry.totalResults, 0),
    source: "tmdb",
  };
}

/** Applies the public browse filters to a dashboard title. */
function matchesCustomFilters(record: CustomTitleRecord, filters: BrowseFilters): boolean {
  if (filters.type && filters.type !== "all" && record.type !== filters.type) return false;
  if (filters.genre && !record.genres.includes(filters.genre)) return false;
  if (filters.year && String(record.year ?? "") !== filters.year) return false;
  if (filters.minRating && (record.rating ?? 0) < filters.minRating) return false;
  if (filters.arabicOnly && !/[\u0600-\u06FF]/.test(record.titleAr)) return false;
  const query = filters.q?.trim().toLowerCase();
  if (query) {
    const haystack = `${record.titleAr} ${record.titleEn}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

/** Dashboard titles that match the current browse/search filters, in the right locale. */
function selectCustomTitles(
  records: Awaited<ReturnType<typeof getPublishedCustomTitles>>,
  filters: BrowseFilters,
  locale: string,
): Title[] {
  return records
    .filter((record) => matchesCustomFilters(record, filters))
    .map((record) => customToTitle(record, locale));
}

function prependCustom(
  base: Paginated<Title>,
  custom: Title[],
  page: number,
  pageSize: number,
): Paginated<Title> {
  if (custom.length === 0) return base;
  const totalResults = base.totalResults + custom.length;
  const totalPages = Math.max(base.totalPages, Math.ceil(totalResults / pageSize), 1);
  const items = page === 1 ? [...custom, ...base.items].slice(0, pageSize) : base.items;
  return { ...base, items, page, totalPages, totalResults };
}

export type CollectionKey =
  | "trending"
  | "popular"
  | "top-rated"
  | "newest"
  | "arabic"
  | "animation"
  | "drama"
  | "comedy";

interface CollectionOptions {
  page?: number;
  pageSize?: number;
  type?: MediaType;
}

export async function getCollection(
  key: CollectionKey,
  locale: string,
  options: CollectionOptions = {},
): Promise<Paginated<Title>> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? 24;
  const type = options.type;

  const live = await tryLive(async () => {
    switch (key) {
      case "trending":
        return tmdbTrending(locale, page);
      case "popular":
        return tmdbList(type === "tv" ? "tv/popular" : "movie/popular", locale, page);
      case "top-rated":
        return tmdbList(type === "tv" ? "tv/top_rated" : "movie/top_rated", locale, page);
      case "newest": {
        const target = type === "tv" ? "tv" : "movie";
        return tmdbDiscover({ type: target, locale, sort: "newest", page });
      }
      case "arabic": {
        const [movies, shows] = await Promise.all([
          tmdbDiscover({ type: "movie", locale, originalLanguage: "ar", page, sort: "popularity" }),
          tmdbDiscover({ type: "tv", locale, originalLanguage: "ar", page, sort: "popularity" }),
        ]);
        return mergePaginated([movies, shows], page, pageSize);
      }
      case "animation":
      case "drama":
      case "comedy": {
        const genre = genreBySlug.get(key);
        const target = type === "tv" ? "tv" : "movie";
        const genreId = target === "tv" ? genre?.tvId : genre?.movieId;
        return tmdbDiscover({ type: target, locale, genre: genreId, page });
      }
      default:
        return null;
    }
  }, `collection:${key}`);

  if (live && live.items.length > 0) {
    return {
      ...live,
      items: live.items.slice(0, pageSize),
      page: live.page,
      totalPages: live.totalPages,
      totalResults: live.totalResults,
      source: "tmdb",
    };
  }

  const fallbackKey =
    key === "popular" ? "popular" : key === "newest" ? "newest" : key === "arabic" ? "arabic" : key === "trending" ? "popular" : key;
  const catalogResult =
    key === "trending"
      ? trendingCatalog(page, pageSize)
      : collectionCatalog(fallbackKey as "popular" | "top-rated" | "newest" | "arabic" | "animation" | "drama" | "comedy", page, pageSize, type);
  return catalogResult;
}

export async function getHomeFeed(locale: string) {
  const railSize = siteConfig.features.railSize;
  const customRecords = await getPublishedCustomTitles();
  const customTitles = customRecords.map((record) => customToTitle(record, locale));
  const featuredCustom = customRecords
    .filter((record) => record.featured)
    .map((record) => customToTitle(record, locale));

  const [trending, popularMovies, topRatedMovies, popularTv, topRatedTv, arabic, drama] = await Promise.all([
    getCollection("trending", locale, { pageSize: railSize }),
    getCollection("popular", locale, { pageSize: railSize, type: "movie" }),
    getCollection("top-rated", locale, { pageSize: railSize, type: "movie" }),
    getCollection("popular", locale, { pageSize: railSize, type: "tv" }),
    getCollection("top-rated", locale, { pageSize: railSize, type: "tv" }),
    getCollection("arabic", locale, { pageSize: railSize }),
    getCollection("drama", locale, { pageSize: railSize }),
  ]);

  const hero = [...featuredCustom, ...trending.items]
    .sort((a, b) => Number(Boolean(b.backdropPath)) - Number(Boolean(a.backdropPath)))
    .slice(0, 8);

  const sections = [
    ...(customTitles.length
      ? [{ key: "recent", href: "/movies", items: customTitles.slice(0, railSize) }]
      : []),
    { key: "trending", href: "/trending", items: trending.items },
    { key: "popularMovies", href: "/movies", items: popularMovies.items },
    { key: "topRatedMovies", href: "/top-rated?type=movie", items: topRatedMovies.items },
    { key: "popularTv", href: "/tv", items: popularTv.items },
    { key: "topRatedTv", href: "/top-rated?type=tv", items: topRatedTv.items },
    { key: "arabic", href: "/arabic", items: arabic.items },
    { key: "drama", href: "/genre/drama", items: drama.items },
  ].filter((section) => section.items.length > 0);

  return {
    hero,
    sections,
    source: currentDataSource(),
    stats: platformStats(),
  };
}

export async function browseTitles(filters: BrowseFilters, locale: string): Promise<Paginated<Title>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 24;
  const query = filters.q?.trim();
  const type = filters.type && filters.type !== "all" ? filters.type : undefined;
  const genre = filters.genre ? genreBySlug.get(filters.genre) : undefined;
  const sort = filters.sort ?? "popularity";

  if (query) {
    return searchTitles({ ...filters, q: query }, locale);
  }

  const customRecords = await getPublishedCustomTitles();
  const custom = selectCustomTitles(customRecords, { ...filters, q: undefined }, locale);

  const live = await tryLive(async () => {
    if (!type) {
      const [movies, shows] = await Promise.all([
        tmdbDiscover({
          type: "movie",
          locale,
          originalLanguage: filters.arabicOnly ? "ar" : undefined,
          genre: genre?.movieId,
          year: filters.year,
          minRating: filters.minRating,
          sort,
          page,
        }),
        tmdbDiscover({
          type: "tv",
          locale,
          originalLanguage: filters.arabicOnly ? "ar" : undefined,
          genre: genre?.tvId,
          year: filters.year,
          minRating: filters.minRating,
          sort,
          page,
        }),
      ]);
      return mergePaginated([movies, shows], page, pageSize, sort);
    }
    return tmdbDiscover({
      type,
      locale,
      originalLanguage: filters.arabicOnly ? "ar" : undefined,
      genre: type === "tv" ? genre?.tvId : genre?.movieId,
      year: filters.year,
      minRating: filters.minRating,
      sort,
      page,
    });
  }, "browse");

  if (live && live.items.length > 0) return prependCustom(live, custom, page, pageSize);

  return prependCustom(browseCatalog({ ...filters, page, pageSize }), custom, page, pageSize);
}

export async function searchTitles(filters: BrowseFilters, locale: string): Promise<Paginated<Title>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 24;
  const query = filters.q?.trim() ?? "";

  if (!query) return browseTitles({ ...filters, q: undefined }, locale);

  const customRecords = await getPublishedCustomTitles();
  const custom = selectCustomTitles(customRecords, { ...filters, q: query }, locale);

  const live = await tryLive(async () => {
    if (!filters.type && !filters.genre && !filters.year && !filters.minRating) {
      return tmdbSearch(query, locale, page);
    }
    // TMDB search does not accept filters: fetch a page, then filter locally.
    const base = await tmdbSearch(query, locale, page);
    const genre = filters.genre ? genreBySlug.get(filters.genre) : undefined;
    const items = base.items.filter((item) => {
      if (filters.type && filters.type !== "all" && item.type !== filters.type) return false;
      if (genre && !item.genreSlugs.includes(genre.slug)) return false;
      if (filters.year && !item.releaseDate?.startsWith(filters.year)) return false;
      if (filters.minRating && item.rating < filters.minRating) return false;
      return true;
    });
    return { ...base, items };
  }, "search");

  if (live && live.items.length > 0) return prependCustom(live, custom, page, pageSize);

  return prependCustom(browseCatalog({ ...filters, q: query, page, pageSize }), custom, page, pageSize);
}

export async function getSuggestions(query: string, locale: string, limit = 8): Promise<Title[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const customRecords = await getPublishedCustomTitles();
  const needle = trimmed.toLowerCase();
  const customMatches = customRecords
    .filter((record) =>
      `${record.titleAr} ${record.titleEn}`.toLowerCase().includes(needle),
    )
    .slice(0, limit)
    .map((record) => customToTitle(record, locale));

  const live = await tryLive(() => tmdbSuggestions(trimmed, locale, limit), "suggestions");
  if (live && live.length > 0) {
    return [...customMatches, ...live].slice(0, limit);
  }
  return [...customMatches, ...catalogSearchSuggestions(trimmed, limit)].slice(0, limit);
}

export const getTitleDetails = cache(async (type: MediaType, id: number, locale: string) => {
  if (isCustomId(id)) {
    const record = await getCustomTitleRecord(id);
    if (!record || !record.published || record.type !== type) {
      return { title: null, related: [] as Title[], source: "catalog" as const };
    }
    return {
      title: customToTitle(record, locale),
      related: await getCustomRelated(record, locale, 16),
      source: "catalog" as const,
    };
  }

  const live = await tryLive(async () => {
    const result = await tmdbDetails(type, id, locale);
    return result;
  }, `details:${type}:${id}`);

  if (live) return { title: live.detail, related: live.related, source: "tmdb" as const };

  const title = findCatalogTitle(type, id);
  if (!title) return { title: null, related: [] as Title[], source: "catalog" as const };
  return { title, related: similarCatalog(title, 16), source: "catalog" as const };
});

export const getRelatedTitles = cache(async (type: MediaType, id: number, locale: string): Promise<Title[]> => {
  const { related } = await getTitleDetails(type, id, locale);
  return related;
});

export const getSeasonEpisodes = cache(
  async (id: number, season: number, locale: string): Promise<EpisodeInfo[]> => {
    if (isCustomId(id)) {
      const record = await getCustomTitleRecord(id);
      const info = record?.type === "tv" ? buildCustomEpisodes(record) : [];
      return info.find((entry) => entry.season === season)?.episodes ?? [];
    }

    const live = await tryLive(() => tmdbSeasonEpisodes(id, season, locale), `season:${id}:${season}`);
    if (live && live.length > 0) return live;

    const title = findCatalogTitle("tv", id);
    const seasonInfo = title?.seasonList?.find((entry) => entry.season === season) ?? title?.seasonList?.[0];
    if (!seasonInfo) return [];
    return Array.from({ length: Math.min(seasonInfo.episodeCount || 0, 40) }, (_, index) => ({
      episode: index + 1,
      name: null,
      overview: null,
      stillPath: null,
      airDate: null,
      runtime: title?.runtime ?? null,
      rating: null,
    }));
  },
);

export function availableYears(): string[] {
  const current = new Date().getFullYear();
  const liveYears = Array.from({ length: current - 1949 }, (_, index) => String(current - index));
  const catalog = new Set(catalogYears());
  return Array.from(new Set([...liveYears, ...catalog])).sort((a, b) => Number(b) - Number(a));
}

export function yearsForSelect(): string[] {
  return availableYears().filter((year) => Number(year) >= 1950);
}

/** Used by the admin dashboard to show how many titles the offline catalog carries. */
export function catalogSize() {
  return catalogTitles.length;
}

export function safeParam(value: string | string[] | undefined) {
  return firstParam(value)?.trim() || undefined;
}

export async function getQuickStats() {
  return {
    ...platformStats(),
    catalog: getCatalogStats(),
  };
}

export async function findByTmdbId(type: MediaType, id: number, locale: string) {
  return getTitleDetails(type, id, locale);
}


/** Expands a dashboard TV title into episode placeholders (titles/streams are optional). */
function buildCustomEpisodes(
  record: NonNullable<Awaited<ReturnType<typeof getCustomTitleRecord>>>,
): { season: number; episodes: EpisodeInfo[] }[] {
  const totalSeasons = Math.min(Math.max(record.seasons ?? 1, 1), 40);
  const perSeason = Math.min(Math.max(record.episodes ?? 1, 1), 500);
  return Array.from({ length: totalSeasons }, (_, index) => ({
    season: index + 1,
    episodes: Array.from({ length: perSeason }, (_unused, episodeIndex) => ({
      episode: episodeIndex + 1,
      name: null,
      overview: null,
      stillPath: null,
      airDate: null,
      runtime: record.runtime,
      rating: record.rating,
    })),
  }));
}

/** Dashboard titles for the admin screen + counts. */
export async function getCustomTitleStats() {
  const records = await getPublishedCustomTitles();
  return {
    total: records.length,
    featured: records.filter((record) => record.featured).length,
    movies: records.filter((record) => record.type === "movie").length,
    shows: records.filter((record) => record.type === "tv").length,
  };
}

import "server-only";
import rawCatalog from "@/data/catalog.json";
import type { BrowseFilters, MediaType, Paginated, Title } from "@/types";
import { paginate } from "@/lib/utils";

interface CatalogFile {
  generatedAt: string;
  source: string;
  counts: { movies: number; tv: number };
  titles: Title[];
}

const file = rawCatalog as unknown as CatalogFile;

/** Real TMDB metadata bundled with the app — used when TMDB_API_KEY is absent. */
export const catalogTitles: Title[] = file.titles.map((title) => ({
  ...title,
  cast: title.cast ?? [],
  creators: title.creators ?? [],
  seasonList: title.seasonList ?? defaultSeasons(title),
}));

const byKey = new Map(catalogTitles.map((title) => [`${title.type}-${title.id}`, title]));

function defaultSeasons(title: Title): Title["seasonList"] {
  if (title.type !== "tv" || !title.seasons) return [];
  const total = title.episodes ?? title.seasons;
  const perSeason = Math.max(1, Math.round(total / title.seasons));
  return Array.from({ length: Math.min(title.seasons, 40) }, (_, index) => ({
    season: index + 1,
    name: null,
    episodeCount: index === title.seasons! - 1 ? Math.max(1, total - perSeason * (title.seasons! - 1)) : perSeason,
    airDate: null,
    posterPath: null,
    overview: null,
  }));
}

export const catalogGeneratedAt = file.generatedAt;
export const catalogCounts = file.counts;

export function findCatalogTitle(type: MediaType, id: number): Title | null {
  return byKey.get(`${type}-${id}`) ?? null;
}

export function getCatalogStats() {
  const genreCount = new Set(catalogTitles.flatMap((title) => title.genreSlugs)).size;
  return {
    titles: catalogTitles.length,
    movies: catalogCounts.movies,
    tv: catalogCounts.tv,
    genres: genreCount,
  };
}

function sortTitles(items: Title[], sort: BrowseFilters["sort"]) {
  const list = [...items];
  switch (sort) {
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.voteCount - a.voteCount);
    case "newest":
      return list.sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "") || b.popularity - a.popularity);
    case "oldest":
      return list.sort((a, b) => (a.releaseDate ?? "9999").localeCompare(b.releaseDate ?? "9999"));
    default:
      return list.sort((a, b) => b.popularity - a.popularity || b.voteCount - a.voteCount);
  }
}

export function browseCatalog(filters: BrowseFilters): Paginated<Title> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const query = filters.q?.trim().toLowerCase();

  let items = catalogTitles.filter((title) => {
    if (filters.type && filters.type !== "all" && title.type !== filters.type) return false;
    if (filters.genre && !title.genreSlugs.includes(filters.genre)) return false;
    if (filters.year && !title.releaseDate?.startsWith(filters.year)) return false;
    if (filters.minRating && title.rating < filters.minRating) return false;
    if (filters.arabicOnly && title.originalLanguage !== "ar") return false;
    if (query) {
      const haystack = `${title.title} ${title.originalTitle} ${title.overview}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  items = sortTitles(items, filters.sort ?? (query ? "popularity" : "popularity"));
  const result = paginate(items, page, pageSize);
  return { ...result, source: "catalog" };
}

export function trendingCatalog(page = 1, pageSize = 24): Paginated<Title> {
  const scored = catalogTitles
    .map((title) => {
      const year = Number(title.releaseDate?.slice(0, 4) || 0);
      const recency = Math.max(0, Math.min(1, (year - 1990) / 35));
      const score =
        Math.log10(title.popularity + 1) * 1.4 +
        Math.log10(title.voteCount + 1) * 1.1 +
        title.rating * 0.45 +
        recency * 1.2;
      return { title, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.title);
  const result = paginate(scored, page, pageSize);
  return { ...result, source: "catalog" };
}

export function collectionCatalog(
  key: "popular" | "top-rated" | "newest" | "arabic" | "animation" | "drama" | "comedy",
  page = 1,
  pageSize = 24,
  type?: MediaType,
): Paginated<Title> {
  let items = catalogTitles.slice();
  if (type) items = items.filter((title) => title.type === type);

  switch (key) {
    case "top-rated":
      items = items.filter((title) => title.voteCount >= 50).sort((a, b) => b.rating - a.rating || b.voteCount - a.voteCount);
      break;
    case "newest":
      items = items
        .filter((title) => title.voteCount >= 20)
        .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
      break;
    case "arabic":
      items = items.filter((title) => title.originalLanguage === "ar").sort((a, b) => b.popularity - a.popularity);
      break;
    case "animation":
    case "drama":
    case "comedy":
      items = items.filter((title) => title.genreSlugs.includes(key)).sort((a, b) => b.popularity - a.popularity);
      break;
    default:
      items = items.sort((a, b) => b.popularity - a.popularity || b.voteCount - a.voteCount);
  }

  const result = paginate(items, page, pageSize);
  return { ...result, source: "catalog" };
}

export function similarCatalog(title: Title, limit = 12): Title[] {
  const genreSet = new Set(title.genreSlugs);
  return catalogTitles
    .filter((candidate) => candidate.type === title.type && candidate.id !== title.id)
    .map((candidate) => {
      const overlap = candidate.genreSlugs.filter((slug) => genreSet.has(slug)).length;
      return { candidate, overlap };
    })
    .filter((entry) => entry.overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        b.candidate.voteCount - a.candidate.voteCount ||
        b.candidate.popularity - a.candidate.popularity,
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function catalogYears(): string[] {
  const years = new Set<string>();
  for (const title of catalogTitles) {
    const year = title.releaseDate?.slice(0, 4);
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function catalogSearchSuggestions(query: string, limit = 8): Title[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return catalogTitles
    .map((title) => {
      const name = title.title.toLowerCase();
      const original = title.originalTitle.toLowerCase();
      let score = 0;
      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 60;
      else if (original.includes(q)) score = 40;
      else if (title.overview.toLowerCase().includes(q)) score = 10;
      return { title, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.title.popularity - a.title.popularity)
    .slice(0, limit)
    .map((entry) => entry.title);
}

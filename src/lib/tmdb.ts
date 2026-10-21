import "server-only";
import type { CastMember, EpisodeInfo, MediaType, Paginated, SeasonInfo, Title } from "@/types";
import { genreByTmdbId, genreByTvTmdbId, type GenreConfig } from "@/config/genres";

const API_BASE = "https://api.themoviedb.org/3";
const REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours server-side caching

export function hasTmdbCredentials() {
  return Boolean((process.env.TMDB_API_KEY || "").trim() || (process.env.TMDB_READ_TOKEN || "").trim());
}

export function tmdbLanguage(locale: string) {
  return locale === "ar" ? "ar-SA" : "en-US";
}

type Params = Record<string, string | number | boolean | undefined>;

export async function tmdbFetch<T>(path: string, params: Params = {}): Promise<T> {
  const key = (process.env.TMDB_API_KEY || "").trim();
  const token = (process.env.TMDB_READ_TOKEN || "").trim();
  if (!key && !token) throw new Error("TMDB credentials are not configured");

  const url = new URL(`${API_BASE}${path}`);
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(name, String(value));
  }
  if (key) url.searchParams.set("api_key", key);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`TMDB ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbListedTitle {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  original_language?: string;
  adult?: boolean;
}

interface TmdbCreditsCast {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

interface TmdbVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
  iso_639_1?: string;
}

interface TmdbSeason {
  season_number: number;
  name?: string;
  episode_count?: number;
  air_date?: string | null;
  poster_path?: string | null;
  overview?: string | null;
}

export interface TmdbDetail extends TmdbListedTitle {
  genres?: TmdbGenre[];
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string | null;
  created_by?: { name: string }[];
  seasons?: TmdbSeason[];
  credits?: { cast?: TmdbCreditsCast[] };
  videos?: { results?: TmdbVideo[] };
  similar?: { results?: TmdbListedTitle[] };
  recommendations?: { results?: TmdbListedTitle[] };
}

interface TmdbListResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbListedTitle[];
}

interface TmdbSeasonResponse {
  episodes?: {
    episode_number: number;
    name?: string;
    overview?: string;
    still_path?: string | null;
    air_date?: string | null;
    runtime?: number | null;
    vote_average?: number | null;
  }[];
}

function genresFromIds(ids: number[] | undefined, type: MediaType): GenreConfig[] {
  if (!ids?.length) return [];
  const map = type === "tv" ? genreByTvTmdbId : genreByTmdbId;
  const found: GenreConfig[] = [];
  for (const id of ids) {
    const genre = map.get(id);
    if (genre && !found.some((item) => item.slug === genre.slug)) found.push(genre);
  }
  return found;
}

function resolveGenres(data: TmdbDetail, type: MediaType): GenreConfig[] {
  if (data.genres?.length) {
    return data.genres.map(
      (genre) =>
        genreByTmdbId.get(genre.id) ?? {
          slug: genre.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          en: genre.name,
          ar: genre.name,
          emoji: "🎬",
        },
    );
  }
  return genresFromIds(data.genre_ids, type);
}

function pickTrailer(videos: TmdbVideo[] | undefined): string | null {
  if (!videos?.length) return null;
  const youtube = videos.filter((video) => video.site === "YouTube" && video.key);
  const trailer = youtube.find((video) => video.type === "Trailer" && video.official) ||
    youtube.find((video) => video.type === "Trailer") ||
    youtube.find((video) => video.type === "Teaser");
  return trailer?.key ?? null;
}

export function mapListedTitle(item: TmdbListedTitle, type: MediaType): Title | null {
  if (!item?.id) return null;
  const title = item.title || item.name || item.original_title || item.original_name;
  if (!title) return null;
  const genres = genresFromIds(item.genre_ids, type);
  return {
    id: item.id,
    type,
    title,
    originalTitle: item.original_title || item.original_name || title,
    overview: item.overview || "",
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    releaseDate: item.release_date || item.first_air_date || null,
    rating: Number(item.vote_average || 0),
    voteCount: Number(item.vote_count || 0),
    popularity: Number(item.popularity || 0),
    genres: genres.map((genre) => genre.en),
    genreSlugs: genres.map((genre) => genre.slug),
    runtime: null,
    seasons: null,
    episodes: null,
    originalLanguage: item.original_language || "en",
    adult: Boolean(item.adult),
  };
}

export function mapDetail(data: TmdbDetail, type: MediaType): Title {
  const genres = resolveGenres(data, type);
  const title = data.title || data.name || "";
  const cast: CastMember[] = (data.credits?.cast ?? []).slice(0, 12).map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character || null,
    profilePath: member.profile_path || null,
  }));

  const runtime = type === "movie" ? data.runtime ?? null : data.episode_run_time?.[0] ?? null;
  const seasons = type === "tv" ? data.number_of_seasons ?? null : null;

  return {
    id: data.id,
    type,
    title,
    originalTitle: data.original_title || data.original_name || title,
    overview: data.overview || "",
    tagline: data.tagline || null,
    posterPath: data.poster_path ?? null,
    backdropPath: data.backdrop_path ?? null,
    releaseDate: data.release_date || data.first_air_date || null,
    rating: Number(data.vote_average || 0),
    voteCount: Number(data.vote_count || 0),
    popularity: Number(data.popularity || 0),
    genres: genres.map((genre) => genre.en),
    genreSlugs: genres.map((genre) => genre.slug),
    runtime,
    seasons,
    episodes: type === "tv" ? data.number_of_episodes ?? null : null,
    originalLanguage: data.original_language || "en",
    status: data.status || null,
    creators: (data.created_by ?? []).map((creator) => creator.name).filter(Boolean),
    cast,
    trailerKey: pickTrailer(data.videos?.results),
    seasonList:
      type === "tv"
        ? (data.seasons ?? [])
            .filter((season) => season.season_number > 0)
            .map<SeasonInfo>((season) => ({
              season: season.season_number,
              name: season.name || null,
              episodeCount: season.episode_count ?? 0,
              airDate: season.air_date || null,
              posterPath: season.poster_path || null,
              overview: season.overview || null,
            }))
        : [],
  };
}

function toPaginated(response: TmdbListResponse, type: MediaType): Paginated<Title> {
  const items = response.results
    .map((item) => mapListedTitle(item, type))
    .filter((item): item is Title => Boolean(item));
  return {
    items,
    page: response.page ?? 1,
    totalPages: Math.min(response.total_pages ?? 1, 500),
    totalResults: response.total_results ?? items.length,
    source: "tmdb",
  };
}

export async function tmdbTrending(locale: string, page = 1) {
  const data = await tmdbFetch<TmdbListResponse>("/trending/all/week", {
    language: tmdbLanguage(locale),
    page,
  });
  const items = data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => mapListedTitle(item, item.media_type as MediaType))
    .filter((item): item is Title => Boolean(item));
  return {
    items,
    page: data.page ?? page,
    totalPages: Math.min(data.total_pages ?? 1, 500),
    totalResults: data.total_results ?? items.length,
    source: "tmdb" as const,
  };
}

type TmdbListKind =
  | "movie/popular"
  | "movie/top_rated"
  | "movie/now_playing"
  | "movie/upcoming"
  | "tv/popular"
  | "tv/top_rated"
  | "tv/airing_today"
  | "tv/on_the_air";

export async function tmdbList(kind: TmdbListKind, locale: string, page = 1) {
  const type: MediaType = kind.startsWith("tv/") ? "tv" : "movie";
  const data = await tmdbFetch<TmdbListResponse>(`/${kind}`, { language: tmdbLanguage(locale), page });
  return toPaginated(data, type);
}

export interface TmdbDiscoverOptions {
  type: MediaType;
  locale: string;
  originalLanguage?: string;
  genre?: number;
  year?: string;
  minRating?: number;
  sort?: "popularity" | "rating" | "newest" | "oldest";
  page?: number;
}

function discoverSort(type: MediaType, sort: TmdbDiscoverOptions["sort"]) {
  if (sort === "rating") return "vote_average.desc";
  if (sort === "newest") return type === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
  if (sort === "oldest") return type === "movie" ? "primary_release_date.asc" : "first_air_date.asc";
  return "popularity.desc";
}

export async function tmdbDiscover(options: TmdbDiscoverOptions) {
  const params: Params = {
    language: tmdbLanguage(options.locale),
    page: options.page ?? 1,
    sort_by: discoverSort(options.type, options.sort),
    include_adult: false,
    "vote_count.gte": 20,
  };
  if (options.genre) params.with_genres = options.genre;
  if (options.year) {
    if (options.type === "movie") params.primary_release_year = options.year;
    else params.first_air_date_year = options.year;
  }
  if (options.minRating) params["vote_average.gte"] = options.minRating;
  if (options.originalLanguage) params.with_original_language = options.originalLanguage;
  if (options.sort === "rating") params["vote_count.gte"] = 200;

  const data = await tmdbFetch<TmdbListResponse>(`/discover/${options.type}`, params);
  return toPaginated(data, options.type);
}

export async function tmdbSearch(query: string, locale: string, page = 1) {
  const data = await tmdbFetch<TmdbListResponse>("/search/multi", {
    query,
    language: tmdbLanguage(locale),
    page,
    include_adult: false,
  });
  const items = data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => mapListedTitle(item, item.media_type as MediaType))
    .filter((item): item is Title => Boolean(item));
  return {
    items,
    page: data.page ?? page,
    totalPages: Math.min(data.total_pages ?? 1, 500),
    totalResults: data.total_results ?? items.length,
    source: "tmdb" as const,
  };
}

export async function tmdbDetails(type: MediaType, id: number, locale: string) {
  const data = await tmdbFetch<TmdbDetail>(`/${type}/${id}`, {
    language: tmdbLanguage(locale),
    append_to_response: "credits,videos,similar,recommendations",
  });
  const detail = mapDetail(data, type);
  const related = [...(data.recommendations?.results ?? []), ...(data.similar?.results ?? [])]
    .map((item) => mapListedTitle(item, type))
    .filter((item): item is Title => Boolean(item))
    .filter((item, index, list) => item.id !== detail.id && list.findIndex((other) => other.id === item.id) === index)
    .slice(0, 16);
  return { detail, related };
}

export async function tmdbSeasonEpisodes(id: number, season: number, locale: string) {
  const data = await tmdbFetch<TmdbSeasonResponse>(`/tv/${id}/season/${season}`, {
    language: tmdbLanguage(locale),
  });
  return (data.episodes ?? []).map<EpisodeInfo>((episode) => ({
    episode: episode.episode_number,
    name: episode.name || null,
    overview: episode.overview || null,
    stillPath: episode.still_path || null,
    airDate: episode.air_date || null,
    runtime: episode.runtime || null,
    rating: episode.vote_average || null,
  }));
}

export async function tmdbSuggestions(query: string, locale: string, limit = 8) {
  const data = await tmdbSearch(query, locale, 1);
  return data.items.slice(0, limit);
}

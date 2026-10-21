export type MediaType = "movie" | "tv";

export interface CastMember {
  id?: number | null;
  name: string;
  character?: string | null;
  profilePath?: string | null;
}

export interface EpisodeInfo {
  episode: number;
  name?: string | null;
  overview?: string | null;
  stillPath?: string | null;
  airDate?: string | null;
  runtime?: number | null;
  rating?: number | null;
}

export interface SeasonInfo {
  season: number;
  name?: string | null;
  episodeCount: number;
  airDate?: string | null;
  posterPath?: string | null;
  overview?: string | null;
}

export interface Title {
  id: number;
  type: MediaType;
  title: string;
  originalTitle: string;
  overview: string;
  tagline?: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number;
  voteCount: number;
  popularity: number;
  genres: string[];
  genreSlugs: string[];
  runtime: number | null;
  seasons: number | null;
  episodes: number | null;
  originalLanguage: string;
  status?: string | null;
  creators?: string[];
  cast?: CastMember[];
  trailerKey?: string | null;
  seasonList?: SeasonInfo[];
  adult?: boolean;
}

export type BrowseSort = "popularity" | "rating" | "newest" | "oldest";

export interface BrowseFilters {
  q?: string;
  type?: MediaType | "all";
  genre?: string;
  year?: string;
  minRating?: number;
  sort?: BrowseSort;
  page?: number;
  pageSize?: number;
  arabicOnly?: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalResults: number;
  source: DataSource;
}

export type DataSource = "tmdb" | "catalog";

export type UserRole = "USER" | "ADMIN";

export interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface WatchlistRecord {
  id: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  rating: number | null;
  releaseDate: string | null;
  createdAt: string;
}

export interface HistoryRecord {
  id: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  season: number | null;
  episode: number | null;
  progress: number;
  duration: number | null;
  lastWatchedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  watchlistItems: number;
  historyItems: number;
  customTitles: number;
  source: DataSource;
  database: boolean;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** A playback link configured by the admin (used by custom titles and overrides). */
export interface CustomStream {
  label: string;
  url: string;
  quality?: string | null;
}

/** A title created from the admin dashboard — lives in the database, not TMDB. */
export interface CustomTitleRecord {
  id: string;
  numericId: number;
  type: MediaType;
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
  genres: string[];
  cast: string[];
  seasons: number | null;
  episodes: number | null;
  streams: CustomStream[];
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomTitleInput {
  type: MediaType;
  titleAr: string;
  titleEn?: string;
  overviewAr?: string;
  overviewEn?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  year?: number | null;
  rating?: number | null;
  runtime?: number | null;
  genres?: string[];
  cast?: string[];
  seasons?: number | null;
  episodes?: number | null;
  streams?: CustomStream[];
  published?: boolean;
  featured?: boolean;
}

/** An admin link that overrides the built-in servers of a real TMDB title. */
export interface StreamSourceRecord {
  id: string;
  mediaType: MediaType;
  tmdbId: number;
  label: string;
  url: string;
  quality: string | null;
  createdAt: string;
}

export interface StreamSourceInput {
  mediaType: MediaType;
  tmdbId: number;
  label: string;
  url: string;
  quality?: string | null;
}

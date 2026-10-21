export interface StreamProvider {
  id: string;
  /** Display name (brand). */
  name: string;
  /** Short label shown in Arabic UI next to the brand. */
  nameAr: string;
  quality: "HD" | "FHD" | "4K";
  movie: (tmdbId: number) => string;
  tv: (tmdbId: number, season: number, episode: number) => string;
}

/**
 * Third-party embed providers, keyed by the real TMDB id of every title.
 * Availability of these public servers changes over time — keep several options so
 * playback always has a fallback. Add/remove providers here only.
 */
export const streamProviders: StreamProvider[] = [
  {
    id: "vidlink",
    name: "VidLink",
    nameAr: "فيد لينك",
    quality: "FHD",
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    nameAr: "فيد سورس",
    quality: "HD",
    movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "embed-su",
    name: "Embed.su",
    nameAr: "إمبد",
    quality: "HD",
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "videasy",
    name: "Videasy",
    nameAr: "فيديزي",
    quality: "FHD",
    movie: (id) => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: "2embed",
    name: "2Embed",
    nameAr: "٢ إمبد",
    quality: "HD",
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    nameAr: "مالتي إمبد",
    quality: "HD",
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: "vidsrc-cc",
    name: "VidSrc CC",
    nameAr: "فيد سورس CC",
    quality: "HD",
    movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
];

export const defaultProvider = streamProviders[0];

export function buildEmbedUrl(
  provider: StreamProvider,
  type: "movie" | "tv",
  tmdbId: number,
  season = 1,
  episode = 1,
) {
  return type === "movie" ? provider.movie(tmdbId) : provider.tv(tmdbId, season, episode);
}

export const playerSandbox = "allow-scripts allow-same-origin allow-forms allow-presentation allow-popups";

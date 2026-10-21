export interface GenreConfig {
  slug: string;
  en: string;
  ar: string;
  emoji: string;
  movieId?: number;
  tvId?: number;
}

/** Canonical genres used across TMDB live data and the bundled catalog. */
export const genres: GenreConfig[] = [
  { slug: "action", en: "Action", ar: "أكشن", emoji: "💥", movieId: 28, tvId: 10759 },
  { slug: "adventure", en: "Adventure", ar: "مغامرة", emoji: "🗺️", movieId: 12, tvId: 10759 },
  { slug: "animation", en: "Animation", ar: "أنيميشن", emoji: "🎨", movieId: 16, tvId: 16 },
  { slug: "comedy", en: "Comedy", ar: "كوميديا", emoji: "😄", movieId: 35, tvId: 35 },
  { slug: "crime", en: "Crime", ar: "جريمة", emoji: "🕵️", movieId: 80, tvId: 80 },
  { slug: "documentary", en: "Documentary", ar: "وثائقي", emoji: "🎥", movieId: 99, tvId: 99 },
  { slug: "drama", en: "Drama", ar: "دراما", emoji: "🎭", movieId: 18, tvId: 18 },
  { slug: "family", en: "Family", ar: "عائلي", emoji: "🏡", movieId: 10751, tvId: 10751 },
  { slug: "fantasy", en: "Fantasy", ar: "فانتازيا", emoji: "🧝", movieId: 14, tvId: 10765 },
  { slug: "history", en: "History", ar: "تاريخي", emoji: "🏛️", movieId: 36, tvId: 36 },
  { slug: "horror", en: "Horror", ar: "رعب", emoji: "👻", movieId: 27, tvId: 27 },
  { slug: "music", en: "Music", ar: "موسيقي", emoji: "🎵", movieId: 10402, tvId: 10402 },
  { slug: "mystery", en: "Mystery", ar: "غموض", emoji: "🔍", movieId: 9648, tvId: 9648 },
  { slug: "romance", en: "Romance", ar: "رومانسي", emoji: "❤️", movieId: 10749, tvId: 10749 },
  { slug: "science-fiction", en: "Science Fiction", ar: "خيال علمي", emoji: "🚀", movieId: 878, tvId: 10765 },
  { slug: "tv-movie", en: "TV Movie", ar: "فيلم تلفزيوني", emoji: "📺", movieId: 10770 },
  { slug: "thriller", en: "Thriller", ar: "إثارة", emoji: "🔪", movieId: 53, tvId: 53 },
  { slug: "war", en: "War", ar: "حرب", emoji: "⚔️", movieId: 10752, tvId: 10768 },
  { slug: "western", en: "Western", ar: "غربي", emoji: "🤠", movieId: 37, tvId: 37 },
  { slug: "kids", en: "Kids", ar: "أطفال", emoji: "🧒", tvId: 10762 },
  { slug: "news", en: "News", ar: "أخبار", emoji: "📰", tvId: 10763 },
  { slug: "reality", en: "Reality", ar: "واقعي", emoji: "📸", tvId: 10764 },
  { slug: "soap", en: "Soap", ar: "دراما طويلة", emoji: "🧼", tvId: 10766 },
  { slug: "talk", en: "Talk", ar: "حواريات", emoji: "🎙️", tvId: 10767 },
];

export const genreBySlug = new Map(genres.map((g) => [g.slug, g]));
export const genreByName = new Map(genres.map((g) => [g.en.toLowerCase(), g]));
export const genreByTmdbId = new Map<number, GenreConfig>();
for (const g of genres) {
  if (g.movieId) genreByTmdbId.set(g.movieId, g);
  if (g.tvId && !genreByTmdbId.has(g.tvId)) genreByTmdbId.set(g.tvId, g);
}
/** TV "Action & Adventure" shares ids; prefer the action entry when mapping lists. */
export const genreByTvTmdbId = new Map<number, GenreConfig>();
for (const g of genres) {
  if (g.tvId && !genreByTvTmdbId.has(g.tvId)) genreByTvTmdbId.set(g.tvId, g);
}

export const displayGenre = (genre: GenreConfig, locale: string) => (locale === "ar" ? genre.ar : genre.en);

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, Film, Globe2, Layers, Play, Star, Tv, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTitleDetails, getSeasonEpisodes } from "@/lib/data";
import { auth } from "@/lib/auth";
import { getStore } from "@/lib/store";
import type { MediaType } from "@/types";
import { backdropUrl, formatDate, formatNumber, formatRuntime, getYear, posterUrl } from "@/lib/utils";
import { genreBySlug } from "@/config/genres";
import { AdSlot } from "@/components/ui/ad-slot";
import { CastRail } from "@/components/media/cast-rail";
import { TrailerDialog } from "@/components/media/trailer-dialog";
import { WatchlistButton } from "@/components/media/watchlist-button";
import { MediaRow } from "@/components/media/media-row";
import { SectionHeading } from "@/components/ui/section-heading";

type PageProps = {
  params: Promise<{ locale: string; type: string; id: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseType(value: string): MediaType | null {
  return value === "movie" || value === "tv" ? value : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, type, id } = await params;
  const mediaType = parseType(type);
  const numericId = Number(id);
  if (!mediaType || !Number.isInteger(numericId)) return {};
  const { title } = await getTitleDetails(mediaType, numericId, locale);
  if (!title) return {};
  const image = backdropUrl(title.backdropPath) ?? posterUrl(title.posterPath, "w780");
  const description = title.overview?.slice(0, 180) || title.title;
  return {
    title: title.title,
    description,
    openGraph: {
      title: title.title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: mediaType === "movie" ? "video.movie" : "video.tv_show",
    },
    alternates: { canonical: `/${locale}/title/${mediaType}/${numericId}` },
  };
}

export default async function TitlePage({ params, searchParams }: PageProps) {
  const { locale, type, id } = await params;
  setRequestLocale(locale);
  const mediaType = parseType(type);
  const numericId = Number(id);
  if (!mediaType || !Number.isInteger(numericId) || numericId <= 0) notFound();

  const { title, related } = await getTitleDetails(mediaType, numericId, locale);
  if (!title) notFound();

  const sp = await searchParams;
  const seasonNumbers = (title.seasonList ?? []).filter((season) => season.season > 0);
  const requestedSeason = Number(sp.season);
  const initialSeason = seasonNumbers.some((season) => season.season === requestedSeason)
    ? requestedSeason
    : seasonNumbers[0]?.season ?? 1;
  const episodes = mediaType === "tv" ? await getSeasonEpisodes(numericId, initialSeason, locale) : [];

  const t = await getTranslations({ locale, namespace: "media" });
  const common = await getTranslations({ locale, namespace: "common" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  let inWatchlist = false;
  try {
    const session = await auth();
    if (session?.user?.id) {
      const store = await getStore();
      inWatchlist = await store.isInWatchlist(session.user.id, numericId, mediaType);
    }
  } catch {
    inWatchlist = false;
  }

  const backdrop = backdropUrl(title.backdropPath, "w1280") ?? posterUrl(title.posterPath, "w780");
  const poster = posterUrl(title.posterPath, "w500");
  const year = getYear(title.releaseDate);
  const runtime = formatRuntime(title.runtime, locale);
  const releaseDate = formatDate(title.releaseDate, locale);
  const watchHref =
    mediaType === "tv"
      ? { pathname: `/watch/tv/${numericId}`, query: { season: String(initialSeason), episode: "1" } }
      : `/watch/movie/${numericId}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": mediaType === "movie" ? "Movie" : "TVSeries",
    name: title.title,
    alternateName: title.originalTitle,
    description: title.overview,
    image: poster ?? undefined,
    datePublished: title.releaseDate ?? undefined,
    genre: title.genres,
    inLanguage: title.originalLanguage,
    ...(title.voteCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: title.rating, ratingCount: title.voteCount, bestRating: 10 } }
      : {}),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="relative overflow-hidden border-b border-line/50">
        {backdrop && (
          <div className="absolute inset-0">
            <Image src={backdrop} alt={title.title} fill priority sizes="100vw" className="object-cover object-top opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/50 to-transparent rtl:bg-gradient-to-l" />
          </div>
        )}

        <div className="container-page relative py-8 sm:py-12">
          <nav className="mb-7 flex flex-wrap items-center gap-2 text-[11px] text-muted/70">
            <Link href="/" className="transition hover:text-gold-300">{nav("home")}</Link>
            <span>/</span>
            <Link href={mediaType === "movie" ? "/movies" : "/tv"} className="transition hover:text-gold-300">
              {mediaType === "movie" ? nav("movies") : nav("series")}
            </Link>
            <span>/</span>
            <span className="truncate text-muted">{title.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[290px_1fr] lg:gap-12">
            <div className="relative mx-auto w-[200px] sm:w-[240px] lg:mx-0 lg:w-full">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-gold-500/25 bg-card shadow-card">
                {poster ? (
                  <Image src={poster} alt={title.title} fill sizes="(max-width: 1024px) 240px, 290px" className="object-cover" priority />
                ) : (
                  <span className="grid h-full place-items-center text-muted"><Film className="h-10 w-10" /></span>
                )}
              </div>
              <div className="absolute -bottom-4 inset-x-4 rounded-xl border border-line bg-card/95 px-4 py-2 text-center backdrop-blur">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300">
                  <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {title.rating > 0 ? title.rating.toFixed(1) : "–"} / 10
                </span>
                <span className="mx-2 text-line">•</span>
                <span className="text-[10px] text-muted">{formatNumber(title.voteCount, locale)} ({common("rating")})</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-300">
                  {mediaType === "movie" ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                  {mediaType === "movie" ? common("movie") : common("tv")}
                </span>
                {title.originalLanguage === "ar" && (
                  <span className="rounded-full bg-nile-600/80 px-3 py-1 text-[10px] font-bold text-white">{t("arabicBadge")}</span>
                )}
                {title.status && <span className="chip">{title.status}</span>}
              </div>

              <h1 className="mt-4 text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                {title.title}
              </h1>
              {title.originalTitle && title.originalTitle !== title.title && (
                <p className="mt-2 text-sm text-muted" dir="auto">{title.originalTitle}</p>
              )}
              {title.tagline && <p className="mt-3 max-w-2xl text-sm italic text-gold-200/80">“{title.tagline}”</p>}

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                {year && (
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {year}</span>
                )}
                {runtime && (
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {runtime}</span>
                )}
                {mediaType === "tv" && title.seasons ? (
                  <span className="inline-flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {title.seasons} {common("seasons")}</span>
                ) : null}
                {title.originalLanguage && (
                  <span className="inline-flex items-center gap-1.5 uppercase"><Globe2 className="h-3.5 w-3.5" /> {title.originalLanguage}</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {title.genreSlugs.map((slug, index) => {
                  const genre = genreBySlug.get(slug);
                  return (
                    <Link key={slug} href={`/genre/${slug}`} className="chip hover:border-gold-500/50 hover:text-gold-300">
                      {genre ? (locale === "ar" ? genre.ar : genre.en) : title.genres[index]}
                    </Link>
                  );
                })}
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-ink-100/85">
                {title.overview || t("noOverview")}
              </p>

              {Boolean(title.creators?.length) && (
                <p className="mt-4 text-xs text-muted">
                  <span className="font-bold text-fg">{t("creators")}:</span> {title.creators?.join(" • ")}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={watchHref} className="btn-gold !px-6 !py-3">
                  <Play className="h-4 w-4 fill-night-950" /> {t("watchNow")}
                </Link>
                {title.trailerKey && <TrailerDialog trailerKey={title.trailerKey} title={title.title} />}
                <WatchlistButton
                  variant="button"
                  initial={inWatchlist}
                  item={{
                    tmdbId: title.id,
                    mediaType: title.type,
                    title: title.title,
                    posterPath: title.posterPath,
                    rating: title.rating || null,
                    releaseDate: title.releaseDate,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-12">
          <section>
            <SectionHeading title={t("cast")} />
            <CastRail cast={title.cast ?? []} locale={locale} />
          </section>

          {mediaType === "tv" && seasonNumbers.length > 0 && (
            <section>
              <SectionHeading title={`${common("seasons")} & ${common("episodes")}`} />
              <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
                {seasonNumbers.map((season) => (
                  <Link
                    key={season.season}
                    href={{ pathname: `/title/tv/${numericId}`, query: { season: String(season.season) } }}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      season.season === initialSeason
                        ? "border-gold-500 bg-gold-500/15 text-gold-300"
                        : "border-line bg-card/60 text-muted hover:border-gold-500/50 hover:text-fg"
                    }`}
                  >
                    {t("seasonN", { n: season.season })}
                    <span className="ms-1.5 text-[10px] opacity-60">({season.episodeCount})</span>
                  </Link>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {episodes.map((episode) => {
                  const still = episode.stillPath ? `https://image.tmdb.org/t/p/w300${episode.stillPath}` : null;
                  return (
                    <Link
                      key={episode.episode}
                      href={{
                        pathname: `/watch/tv/${numericId}`,
                        query: { season: String(initialSeason), episode: String(episode.episode) },
                      }}
                      className="group flex gap-3 overflow-hidden rounded-xl border border-line bg-card/50 p-2.5 transition hover:border-gold-500/50"
                    >
                      <span className="relative grid h-[70px] w-[110px] shrink-0 place-items-center overflow-hidden rounded-lg bg-night-900 text-muted">
                        {still ? (
                          <Image src={still} alt={episode.name ?? `Episode ${episode.episode}`} fill sizes="110px" className="object-cover" />
                        ) : (
                          <Play className="h-5 w-5 text-gold-400" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 py-0.5">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400">
                            {t("episodeN", { n: episode.episode })}
                          </span>
                          {episode.runtime ? <span className="text-[10px] text-muted/60">{episode.runtime} {common("min")}</span> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-fg">
                          {episode.name || `${common("episode")} ${episode.episode}`}
                        </span>
                        {episode.overview && <span className="mt-1 line-clamp-2 block text-[10px] leading-4 text-muted/70">{episode.overview}</span>}
                      </span>
                    </Link>
                  );
                })}
              </div>
              {!episodes.length && (
                <p className="text-xs text-muted">{t("noSimilar")}</p>
              )}
            </section>
          )}

          <section>
            {related.length ? (
              <MediaRow title={t("recommendations")} items={related} />
            ) : (
              <>
                <SectionHeading title={t("similar")} />
                <p className="text-sm text-muted">{t("noSimilar")}</p>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
              <Users className="h-4 w-4 text-gold-400" /> {t("details")}
            </h2>
            <dl className="space-y-3 text-xs">
              <DetailRow label={t("releaseDate")} value={releaseDate ?? "—"} />
              <DetailRow label={t("runtime")} value={runtime ?? "—"} />
              <DetailRow label={t("status")} value={title.status ?? "—"} />
              {mediaType === "tv" && <DetailRow label={t("seasons")} value={String(title.seasons ?? "—")} />}
              {mediaType === "tv" && <DetailRow label={t("episodes")} value={String(title.episodes ?? "—")} />}
              <DetailRow label={t("originalLanguage")} value={title.originalLanguage.toUpperCase()} />
              <DetailRow label={common("rating")} value={`${title.rating.toFixed(1)} / 10`} />
            </dl>
          </div>

          <AdSlot id="title-sidebar" label="AD_SLOT · SIDEBAR" className="max-w-none" />

          <div className="surface p-5 text-[11px] leading-6 text-muted/80">
            {locale === "ar"
              ? "البيانات مصدرها TMDB. التشغيل يتم عبر سيرفرات خارجية متعددة؛ إن لم يعمل سيرفر جرّب آخر من صفحة المشاهدة."
              : "Metadata comes from TMDB. Playback uses multiple third-party servers; if one fails, pick another on the watch page."}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/50 pb-2.5 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-end font-semibold text-fg">{value}</dd>
    </div>
  );
}

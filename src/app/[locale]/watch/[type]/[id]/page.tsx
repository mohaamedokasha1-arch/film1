import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Film, Play } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSeasonEpisodes, getTitleDetails } from "@/lib/data";
import { getCustomTitleRecord, getStreamOverrides, isCustomId } from "@/lib/custom";
import type { MediaType } from "@/types";
import { backdropUrl, cn, getYear, posterUrl } from "@/lib/utils";
import { AdSlot } from "@/components/ui/ad-slot";
import { VideoPlayer } from "@/components/media/video-player";
import { HistoryRecorder } from "@/components/media/history-recorder";
import { MediaRow } from "@/components/media/media-row";
import { SectionHeading } from "@/components/ui/section-heading";

type PageProps = {
  params: Promise<{ locale: string; type: string; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
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
  const t = await getTranslations({ locale, namespace: "player" });
  return { title: t("title", { title: title.title }), robots: { index: false, follow: true } };
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { locale, type, id } = await params;
  setRequestLocale(locale);
  const mediaType = parseType(type);
  const numericId = Number(id);
  if (!mediaType || !Number.isInteger(numericId) || numericId <= 0) notFound();

  const { title, related } = await getTitleDetails(mediaType, numericId, locale);
  if (!title) notFound();

  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "player" });
  const media = await getTranslations({ locale, namespace: "media" });
  const common = await getTranslations({ locale, namespace: "common" });

  const seasonList = (title.seasonList ?? []).filter((season) => season.season > 0);
  const seasonNumbers = seasonList.map((season) => season.season);

  let season = Number(sp.season);
  if (!seasonNumbers.includes(season)) season = seasonNumbers[0] ?? 1;
  const episodes = mediaType === "tv" ? await getSeasonEpisodes(numericId, season, locale) : [];

  let episode = Number(sp.episode);
  if (!Number.isInteger(episode) || episode < 1) episode = 1;
  if (episodes.length) episode = Math.min(episode, episodes.length);

  const adminStreams = isCustomId(numericId)
    ? ((await getCustomTitleRecord(numericId))?.streams ?? [])
    : await getStreamOverrides(mediaType, numericId);

  const poster = posterUrl(title.posterPath, "w342");
  const currentEpisode = episodes.find((entry) => entry.episode === episode);
  const previous = episode > 1 ? episode - 1 : null;
  const next = episodes.length && episode < episodes.length ? episode + 1 : null;

  return (
    <div className="container-page py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/title/${mediaType}/${numericId}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-gold-300"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("backToDetails")}
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {title.title}
            {mediaType === "tv" && (
              <span className="ms-3 align-middle text-sm font-semibold text-muted">
                {media("seasonN", { n: season })} · {media("episodeN", { n: episode })}
              </span>
            )}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <span>{getYear(title.releaseDate) ?? ""}</span>
            <span className="text-line">•</span>
            <span>{title.genres.slice(0, 3).join(" · ")}</span>
            {currentEpisode?.name && (
              <>
                <span className="text-line">•</span>
                <span className="text-gold-300/90">{currentEpisode.name}</span>
              </>
            )}
          </div>
        </div>
        {mediaType === "tv" && (
          <div className="flex items-center gap-2">
            {previous ? (
              <Link
                href={{ pathname: `/watch/tv/${numericId}`, query: { season: String(season), episode: String(previous) } }}
                className="btn-outline !px-3.5 !py-2 !text-[11px]"
              >
                <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("previous")}
              </Link>
            ) : null}
            {next ? (
              <Link
                href={{ pathname: `/watch/tv/${numericId}`, query: { season: String(season), episode: String(next) } }}
                className="btn-gold !px-3.5 !py-2 !text-[11px]"
              >
                {t("next")} <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            ) : null}
          </div>
        )}
      </div>

      <AdSlot id="before-player" label="AD_SLOT · BEFORE PLAYER" className="mb-5" />

      <VideoPlayer
        tmdbId={numericId}
        mediaType={mediaType}
        title={title.title}
        season={season}
        episode={episode}
        customStreams={adminStreams}
        builtInServers={!isCustomId(numericId)}
        poster={backdropUrl(title.backdropPath, "w1280") ?? posterUrl(title.posterPath, "w780")}
      />

      <HistoryRecorder
        tmdbId={numericId}
        mediaType={mediaType}
        title={title.title}
        posterPath={title.posterPath}
        season={mediaType === "tv" ? season : null}
        episode={mediaType === "tv" ? episode : null}
        duration={title.runtime}
        progress={mediaType === "tv" ? 8 : 5}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          {mediaType === "tv" && (
            <section>
              <SectionHeading title={`${common("seasons")} & ${common("episodes")}`} />
              {seasonNumbers.length > 1 && (
                <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
                  {seasonNumbers.map((entry) => (
                    <Link
                      key={entry}
                      href={{ pathname: `/watch/tv/${numericId}`, query: { season: String(entry), episode: "1" } }}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-1.5 text-[11px] font-bold transition",
                        entry === season
                          ? "border-gold-500 bg-gold-500/15 text-gold-300"
                          : "border-line bg-card/50 text-muted hover:text-fg",
                      )}
                    >
                      {media("seasonN", { n: entry })}
                    </Link>
                  ))}
                </div>
              )}

              <div className="grid max-h-[420px] gap-2 overflow-y-auto pe-1 sm:grid-cols-2 lg:grid-cols-3">
                {episodes.map((entry) => (
                  <Link
                    key={entry.episode}
                    href={{ pathname: `/watch/tv/${numericId}`, query: { season: String(season), episode: String(entry.episode) } }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border p-2.5 transition",
                      entry.episode === episode
                        ? "border-gold-500/60 bg-gold-500/10"
                        : "border-line bg-card/40 hover:border-gold-500/40",
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-bg/70 text-[11px] font-bold text-muted">
                      {entry.episode}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-semibold text-fg">
                        {entry.name || `${common("episode")} ${entry.episode}`}
                      </span>
                      {entry.runtime ? <span className="text-[9px] text-muted/60">{entry.runtime} {common("min")}</span> : null}
                    </span>
                    {entry.episode === episode && <Play className="ms-auto h-3.5 w-3.5 fill-gold-400 text-gold-400" />}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="surface p-5">
            <h2 className="mb-3 text-sm font-bold">{media("overview")}</h2>
            <p className="text-sm leading-7 text-muted">{title.overview || media("noOverview")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {title.genreSlugs.map((slug) => (
                <Link key={slug} href={`/genre/${slug}`} className="chip hover:border-gold-500/50 hover:text-gold-300">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </section>

          {related.length > 0 && <MediaRow title={media("recommendations")} items={related} />}
        </div>

        <aside className="space-y-4">
          <Link
            href={`/title/${mediaType}/${numericId}`}
            className="surface block overflow-hidden transition hover:border-gold-500/50"
          >
            <div className="relative aspect-[16/10] w-full bg-night-900">
              {poster ? <Image src={poster} alt={title.title} fill sizes="300px" className="object-cover object-top opacity-80" /> : <Film className="absolute inset-0 m-auto h-8 w-8 text-muted" />}
            </div>
            <div className="p-4">
              <p className="text-sm font-bold">{title.title}</p>
              <p className="mt-1 text-[11px] text-muted">{media("ratingOf", { rating: title.rating.toFixed(1) })}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gold-300">
                {media("moreInfo")} <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </div>
          </Link>
          <AdSlot id="title-sidebar" label="AD_SLOT · SIDEBAR" className="max-w-none" />
        </aside>
      </div>
    </div>
  );
}

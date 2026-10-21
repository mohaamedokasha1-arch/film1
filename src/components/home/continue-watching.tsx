import Image from "next/image";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { HistoryRecord } from "@/types";
import { formatDate, posterUrl } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";

export async function ContinueWatching({ items, locale }: { items: HistoryRecord[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const media = await getTranslations({ locale, namespace: "media" });

  if (!items.length) return null;

  return (
    <section>
      <SectionHeading title={t("continueWatching")} />
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {items.slice(0, 10).map((item) => {
          const image = posterUrl(item.posterPath, "w342");
          const season = item.season ?? 1;
          const episode = item.episode ?? 1;
          const href =
            item.mediaType === "tv"
              ? { pathname: `/watch/tv/${item.tmdbId}`, query: { season: String(season), episode: String(episode) } }
              : `/watch/movie/${item.tmdbId}`;
          return (
            <Link
              key={item.id}
              href={href}
              className="group w-[240px] shrink-0 overflow-hidden rounded-xl border border-line bg-card transition hover:border-gold-500/60"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-night-900">
                {image ? (
                  <Image src={image} alt={item.title} fill sizes="240px" className="object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100" />
                ) : null}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-night-950 shadow-glow">
                    <Play className="h-4 w-4 translate-x-px fill-night-950" />
                  </span>
                </span>
                <span className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
                  <span className="block h-full bg-gold-500" style={{ width: `${item.progress}%` }} />
                </span>
              </div>
              <div className="px-3 py-2.5">
                <p className="truncate text-xs font-bold text-fg">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-muted">
                  {item.mediaType === "tv" ? `${media("seasonN", { n: item.season ?? 1 })} · ${media("episodeN", { n: item.episode ?? 1 })}` : media("movie")}
                  {item.lastWatchedAt ? ` · ${formatDate(item.lastWatchedAt, locale)}` : ""}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

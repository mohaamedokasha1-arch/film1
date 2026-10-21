"use client";

import Image from "next/image";
import { Play, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { HistoryRecord } from "@/types";
import { formatDate, posterUrl } from "@/lib/utils";

export function HistoryRow({ item, locale }: { item: HistoryRecord; locale: string }) {
  const t = useTranslations("account");
  const media = useTranslations("media");
  const router = useRouter();
  const image = posterUrl(item.posterPath, "w185");

  const href =
    item.mediaType === "tv"
      ? { pathname: `/watch/tv/${item.tmdbId}`, query: { season: String(item.season ?? 1), episode: String(item.episode ?? 1) } }
      : `/watch/movie/${item.tmdbId}`;

  const remove = async () => {
    await fetch(`/api/history?tmdbId=${item.tmdbId}&mediaType=${item.mediaType}`, { method: "DELETE" }).catch(() => undefined);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-card/40 p-3">
      <Link href={`/title/${item.mediaType}/${item.tmdbId}`} className="relative block h-[92px] w-16 shrink-0 overflow-hidden rounded-lg bg-night-900">
        {image ? <Image src={image} alt={item.title} fill sizes="64px" className="object-cover" /> : null}
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{item.title}</p>
        <p className="mt-0.5 text-[11px] text-muted">
          {item.mediaType === "tv" ? `${media("seasonN", { n: item.season ?? 1 })} · ${media("episodeN", { n: item.episode ?? 1 })}` : media("movie")}
          <span className="mx-1.5 text-line">•</span>
          {t("lastWatched", { date: formatDate(item.lastWatchedAt, locale) ?? "" })}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full rounded-full bg-gold-500" style={{ width: `${Math.min(100, Math.max(3, item.progress))}%` }} />
          </span>
          <span className="text-[9px] font-semibold text-gold-300">{t("progressWatched", { percent: item.progress })}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Link href={href} aria-label={t("continue")} className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/50 text-gold-300 transition hover:bg-gold-500 hover:text-night-950">
          <Play className="h-4 w-4 fill-current" />
        </Link>
        <button type="button" onClick={remove} aria-label={t("remove")} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-nile-400 hover:text-nile-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

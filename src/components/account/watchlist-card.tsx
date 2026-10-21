"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { WatchlistRecord } from "@/types";
import { getYear, posterUrl } from "@/lib/utils";

export function WatchlistCard({ item }: { item: WatchlistRecord }) {
  const media = useTranslations("media");
  const common = useTranslations("common");
  const router = useRouter();
  const image = posterUrl(item.posterPath, "w342");

  const remove = async () => {
    await fetch(`/api/watchlist?tmdbId=${item.tmdbId}&mediaType=${item.mediaType}`, { method: "DELETE" }).catch(() => undefined);
    router.refresh();
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-line bg-card/50 transition hover:border-gold-500/50">
      <Link href={`/title/${item.mediaType}/${item.tmdbId}`} className="block">
        <div className="relative aspect-[2/3] w-full bg-night-900">
          {image ? (
            <Image src={image} alt={item.title} fill sizes="(max-width: 640px) 45vw, 180px" className="object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <span className="grid h-full place-items-center text-xs text-muted">{common("noImage")}</span>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2.5">
            <span className="block truncate text-[11px] font-bold text-white">{item.title}</span>
            <span className="text-[9px] text-white/60">{getYear(item.releaseDate) ?? "—"}</span>
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={remove}
        aria-label={media("removeFromWatchlist")}
        className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/60 text-white/80 backdrop-blur transition hover:border-nile-400 hover:text-nile-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

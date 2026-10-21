import Image from "next/image";
import { Film, Play, Tv } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Title } from "@/types";
import { getYear, posterUrl } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { WatchlistButton } from "./watchlist-button";

export function MediaCard({ title, locale, priority = false }: { title: Title; locale: string; priority?: boolean }) {
  const poster = posterUrl(title.posterPath, "w500");
  const year = getYear(title.releaseDate);
  const genre = title.genres[0];

  return (
    <article className="group relative w-[150px] shrink-0 sm:w-[168px] lg:w-[184px]">
      <Link href={`/title/${title.type}/${title.id}`} className="block focus:outline-none">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-line/70 bg-card shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:border-gold-500/60 group-hover:shadow-glow">
          {poster ? (
            <Image
              src={poster}
              alt={title.title}
              fill
              sizes="(max-width: 640px) 150px, (max-width: 1024px) 168px, 184px"
              priority={priority}
              className="object-cover transition duration-500 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-night-800 to-night-950 text-muted">
              <Film className="h-8 w-8" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 transition group-hover:opacity-95" />

          <div className="absolute start-2 top-2 flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold text-gold-300 backdrop-blur">
                ★ {title.rating > 0 ? title.rating.toFixed(1) : "–"}
              </span>
              {title.originalLanguage === "ar" && (
                <span className="rounded-full bg-nile-500/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  {locale === "ar" ? "عربي" : "Arabic"}
                </span>
              )}
          </div>

          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/80 backdrop-blur">
            {title.type === "movie" ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
            {title.type === "movie" ? (locale === "ar" ? "فيلم" : "Movie") : locale === "ar" ? "مسلسل" : "Series"}
          </span>

          <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-gold-300/70 bg-gold-500/95 text-night-950 shadow-glow">
              <Play className="h-5 w-5 translate-x-px fill-night-950" />
            </span>
          </span>
        </div>

        <div className="mt-2.5 px-0.5">
          <h3 className="truncate text-[13px] font-bold text-fg transition group-hover:text-gold-300">{title.title}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
            {year && <span>{year}</span>}
            {year && genre && <span className="text-line">•</span>}
            {genre && <span className="truncate">{genre}</span>}
            <Rating value={title.rating} showStar={false} className="ms-auto text-[10px] text-muted/70" />
          </p>
        </div>
      </Link>
      <WatchlistButton
        className="absolute end-2 top-2 z-20"
        item={{
          tmdbId: title.id,
          mediaType: title.type,
          title: title.title,
          posterPath: title.posterPath,
          rating: title.rating || null,
          releaseDate: title.releaseDate,
        }}
      />
    </article>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Info, Play, Star, Tv } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Title } from "@/types";
import { backdropUrl, cn, formatRuntime, getYear, posterUrl } from "@/lib/utils";
import { WatchlistButton } from "./watchlist-button";

export function HeroSlider({ items }: { items: Title[] }) {
  const locale = useLocale();
  const t = useTranslations("media");
  const home = useTranslations("home");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => items.slice(0, 6), [items]);
  const active = slides[index];

  const go = useCallback(
    (direction: 1 | -1) => {
      setIndex((current) => (current + direction + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setTimeout(() => go(1), 8000);
    return () => clearTimeout(timer);
  }, [index, paused, go, slides.length]);

  if (!active) return null;

  const year = getYear(active.releaseDate);
  const runtime = formatRuntime(active.runtime, locale);
  const background = backdropUrl(active.backdropPath, "original") ?? posterUrl(active.posterPath, "w780");
  const poster = posterUrl(active.posterPath, "w500");

  return (
    <section
      className="relative isolate min-h-[600px] overflow-hidden border-b border-line/40 sm:min-h-[640px] lg:h-[78vh] lg:max-h-[860px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {background && (
            <Image
              src={background}
              alt={active.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/20 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-bg/50" />
          <div className="absolute inset-0 grain" />
        </motion.div>
      </AnimatePresence>

      <div className="container-page relative z-10 flex h-full min-h-[600px] flex-col justify-center py-14 sm:min-h-[640px] lg:py-0">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold-300">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" /> {home("heroTag")}
              </span>
              <span className="text-muted/70">{home("badge")}</span>
            </div>

            <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {active.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1 text-gold-300">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {active.rating.toFixed(1)}
              </span>
              <span className="text-line">|</span>
              {year && <span>{year}</span>}
              <span className="text-line">|</span>
              <span className="inline-flex items-center gap-1">
                {active.type === "movie" ? <Film className="h-3.5 w-3.5" /> : <Tv className="h-3.5 w-3.5" />}
                {active.type === "movie" ? t("details") : locale === "ar" ? "مسلسل" : "Series"}
              </span>
              {runtime && (
                <>
                  <span className="text-line">|</span>
                  <span>{runtime}</span>
                </>
              )}
              {active.type === "tv" && active.seasons ? (
                <>
                  <span className="text-line">|</span>
                  <span>{active.seasons} {locale === "ar" ? "مواسم" : "seasons"}</span>
                </>
              ) : null}
              {active.originalLanguage === "ar" && (
                <span className="rounded-full bg-nile-600/80 px-2 py-0.5 text-[9px] font-bold text-white">
                  {t("arabicBadge")}
                </span>
              )}
            </div>

            <p className="mt-5 max-w-xl text-sm leading-7 text-ink-200/85 sm:text-[15px]">
              {active.overview ? active.overview.slice(0, 240) : home("heroSubtitle")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={`/watch/${active.type}/${active.id}`} className="btn-gold !px-6 !py-3">
                <Play className="h-4 w-4 fill-night-950" /> {t("watchNow")}
              </Link>
              <Link href={`/title/${active.type}/${active.id}`} className="btn-outline !px-5 !py-3">
                <Info className="h-4 w-4" /> {t("moreInfo")}
              </Link>
              <WatchlistButton
                variant="button"
                className="!py-3"
                item={{
                  tmdbId: active.id,
                  mediaType: active.type,
                  title: active.title,
                  posterPath: active.posterPath,
                  rating: active.rating || null,
                  releaseDate: active.releaseDate,
                }}
              />
            </div>

            <div className="mt-9 flex items-center gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(slideIndex)}
                  aria-label={`slide ${slideIndex + 1}`}
                  aria-current={slideIndex === index}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    slideIndex === index ? "w-10 bg-gold-400" : "w-4 bg-white/25 hover:bg-white/40",
                  )}
                />
              ))}
              <span className="ms-2 text-[10px] font-semibold tracking-widest text-muted/70">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="relative hidden justify-self-end lg:block">
            {poster && (
              <motion.div
                key={`poster-${active.id}`}
                initial={{ opacity: 0, y: 24, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="relative w-[280px] overflow-hidden rounded-2xl border border-gold-500/30 shadow-[0_35px_80px_-30px_rgba(0,0,0,0.95)]"
              >
                <Image
                  src={poster}
                  alt={active.title}
                  width={500}
                  height={750}
                  className="aspect-[2/3] w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute inset-x-0 bottom-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                  {home("heroTag")}
                </span>
              </motion.div>
            )}
            <div className="absolute -start-8 top-1/3 hidden h-32 w-32 rounded-full bg-gold-500/20 blur-3xl xl:block" />
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="previous slide"
            className="absolute start-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur transition hover:border-gold-400 hover:text-gold-300 xl:grid"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="next slide"
            className="absolute end-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur transition hover:border-gold-400 hover:text-gold-300 xl:grid"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </>
      )}
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { genres } from "@/config/genres";
import { cn } from "@/lib/utils";

export interface FilterValues {
  q?: string;
  type?: string;
  genre?: string;
  year?: string;
  rating?: string;
  sort?: string;
}

export function FilterBar({
  values,
  years,
  showType = true,
  showGenre = true,
  basePath,
  resultCount,
}: {
  values: FilterValues;
  years: string[];
  showType?: boolean;
  showGenre?: boolean;
  basePath?: string;
  resultCount?: number;
}) {
  const t = useTranslations("filters");
  const searchT = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeCount = useMemo(
    () => [values.genre, values.year, values.rating, values.sort, showType ? values.type : undefined].filter(Boolean).length,
    [values, showType],
  );

  const update = (key: keyof FilterValues, value: string) => {
    const params = new URLSearchParams();
    if (values.q) params.set("q", values.q);
    const next = { ...values, [key]: value };
    for (const field of ["q", "type", "genre", "year", "rating", "sort"] as const) {
      const entry = next[field];
      if (entry) params.set(field, entry);
    }
    const suffix = params.toString();
    router.push(`${basePath ?? pathname}${suffix ? `?${suffix}` : ""}`);
  };

  const reset = () => {
    const params = new URLSearchParams();
    if (values.q) params.set("q", values.q);
    const suffix = params.toString();
    router.push(`${basePath ?? pathname}${suffix ? `?${suffix}` : ""}`);
  };

  const selectClass =
    "h-10 w-full appearance-none rounded-xl border border-line bg-card/70 px-3 text-xs font-semibold text-fg outline-none transition focus:border-gold-500/60";

  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 text-xs font-bold text-fg md:cursor-default"
          aria-expanded={open}
        >
          <SlidersHorizontal className="h-4 w-4 text-gold-400" />
          {t("title")}
          {activeCount > 0 && (
            <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-300">
              {t("activeCount", { count: activeCount })}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3">
          {typeof resultCount === "number" && (
            <span className="text-[11px] text-muted">
              {resultCount} {searchT("types.all") === "All" ? "results" : "نتيجة"}
            </span>
          )}
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted transition hover:text-gold-300"
          >
            <X className="h-3 w-3" /> {t("clear")}
          </button>
        </div>
      </div>

      <div className={cn("mt-4 grid gap-3 sm:grid-cols-2", showGenre ? "lg:grid-cols-5" : "lg:grid-cols-4", !open && "hidden md:grid")}>
        {showType && (
          <label className="block">
            <span className="label">{t("type")}</span>
            <select className={selectClass} value={values.type ?? "all"} onChange={(event) => update("type", event.target.value === "all" ? "" : event.target.value)}>
              <option value="all">{searchT("types.all")}</option>
              <option value="movie">{searchT("types.movie")}</option>
              <option value="tv">{searchT("types.tv")}</option>
            </select>
          </label>
        )}

        {showGenre && (
          <label className="block">
            <span className="label">{t("genre")}</span>
            <select className={selectClass} value={values.genre ?? ""} onChange={(event) => update("genre", event.target.value)}>
              <option value="">{t("allGenres")}</option>
              {genres.map((genre) => (
                <option key={genre.slug} value={genre.slug}>
                  {locale === "ar" ? genre.ar : genre.en}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="label">{t("year")}</span>
          <select className={selectClass} value={values.year ?? ""} onChange={(event) => update("year", event.target.value)}>
            <option value="">{t("allYears")}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">{t("rating")}</span>
          <select className={selectClass} value={values.rating ?? ""} onChange={(event) => update("rating", event.target.value)}>
            <option value="">{searchT("ratingAny")}</option>
            <option value="6">{searchT("rating6")}</option>
            <option value="7">{searchT("rating7")}</option>
            <option value="8">{searchT("rating8")}</option>
            <option value="9">{searchT("rating9")}</option>
          </select>
        </label>

        <label className="block">
          <span className="label">{t("sort")}</span>
          <select className={selectClass} value={values.sort ?? "popularity"} onChange={(event) => update("sort", event.target.value)}>
            <option value="popularity">{searchT("sortPopularity")}</option>
            <option value="rating">{searchT("sortRating")}</option>
            <option value="newest">{searchT("sortNewest")}</option>
            <option value="oldest">{searchT("sortOldest")}</option>
          </select>
        </label>
      </div>
    </div>
  );
}

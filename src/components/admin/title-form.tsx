"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Film,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  Tv,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { genres } from "@/config/genres";
import type { CustomStream, CustomTitleRecord, MediaType } from "@/types";
import { cn } from "@/lib/utils";

interface StreamRow {
  label: string;
  url: string;
  quality: string;
}

interface FormState {
  type: MediaType;
  titleAr: string;
  titleEn: string;
  year: string;
  rating: string;
  runtime: string;
  seasons: string;
  episodes: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  overviewAr: string;
  overviewEn: string;
  genres: string[];
  cast: string;
  published: boolean;
  featured: boolean;
}

interface ImportResult {
  id: number;
  type: MediaType;
  title: string;
  originalTitle: string;
  year: string | null;
  posterUrl: string | null;
  rating: number;
}

interface Prefill {
  type: MediaType;
  titleAr: string;
  titleEn: string;
  overviewAr: string;
  overviewEn: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  year: number | null;
  rating: number | null;
  runtime: number | null;
  genres: string[];
  cast: string[];
  seasons: number | null;
  episodes: number | null;
}

const QUALITIES = ["HD", "FHD", "4K"];

function toRows(streams: CustomStream[]): StreamRow[] {
  if (!streams.length) return [{ label: "", url: "", quality: "HD" }];
  return streams.map((stream) => ({
    label: stream.label ?? "",
    url: stream.url,
    quality: stream.quality ?? "HD",
  }));
}

function initialState(record?: CustomTitleRecord): FormState {
  return {
    type: record?.type ?? "movie",
    titleAr: record?.titleAr ?? "",
    titleEn: record?.titleEn ?? "",
    year: record?.year ? String(record.year) : "",
    rating: record?.rating !== null && record?.rating !== undefined ? String(record.rating) : "",
    runtime: record?.runtime ? String(record.runtime) : "",
    seasons: record?.seasons ? String(record.seasons) : "",
    episodes: record?.episodes ? String(record.episodes) : "",
    posterUrl: record?.posterUrl ?? "",
    backdropUrl: record?.backdropUrl ?? "",
    trailerUrl: record?.trailerUrl ?? "",
    overviewAr: record?.overviewAr ?? "",
    overviewEn: record?.overviewEn ?? "",
    genres: record?.genres ?? [],
    cast: (record?.cast ?? []).join(", "),
    published: record?.published ?? true,
    featured: record?.featured ?? false,
  };
}

function numberOrNull(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

export function TitleForm({ mode, record }: { mode: "create" | "edit"; record?: CustomTitleRecord }) {
  const t = useTranslations("studio");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() => initialState(record));
  const [streams, setStreams] = useState<StreamRow[]>(() => toRows(record?.streams ?? []));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quick import from the bundled catalog / TMDB.
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ImportResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [tmdbId, setTmdbId] = useState("");
  const [importNote, setImportNote] = useState<string | null>(null);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleGenre = (slug: string) =>
    setForm((current) => ({
      ...current,
      genres: current.genres.includes(slug)
        ? current.genres.filter((entry) => entry !== slug)
        : [...current.genres, slug],
    }));

  const updateStream = (index: number, patchStream: Partial<StreamRow>) =>
    setStreams((current) => current.map((row, i) => (i === index ? { ...row, ...patchStream } : row)));

  const applyPrefill = (prefill: Prefill) => {
    setForm((current) => ({
      ...current,
      type: prefill.type,
      titleAr: prefill.titleAr || current.titleAr,
      titleEn: prefill.titleEn || current.titleEn,
      overviewAr: prefill.overviewAr || current.overviewAr,
      overviewEn: prefill.overviewEn || current.overviewEn,
      posterUrl: prefill.posterUrl ?? current.posterUrl,
      backdropUrl: prefill.backdropUrl ?? current.backdropUrl,
      trailerUrl: prefill.trailerUrl ?? current.trailerUrl,
      year: prefill.year ? String(prefill.year) : current.year,
      rating: prefill.rating ? String(prefill.rating) : current.rating,
      runtime: prefill.runtime ? String(prefill.runtime) : current.runtime,
      seasons: prefill.seasons ? String(prefill.seasons) : current.seasons,
      episodes: prefill.episodes ? String(prefill.episodes) : current.episodes,
      genres: prefill.genres.length ? prefill.genres : current.genres,
      cast: prefill.cast.length ? prefill.cast.join(", ") : current.cast,
    }));
    setImportNote(t("imported"));
    setResults([]);
  };

  const runSearch = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setImportNote(null);
    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "catalog", query }),
      });
      const data = (await response.json()) as { ok: boolean; results?: ImportResult[] };
      setResults(data.results ?? []);
      if (!data.results?.length) setImportNote(t("importEmpty"));
    } catch {
      setImportNote(t("importFailed"));
    } finally {
      setSearching(false);
    }
  };

  const importFromTmdb = async () => {
    const id = Number(tmdbId);
    if (!Number.isInteger(id) || id <= 0) return;
    setSearching(true);
    setImportNote(null);
    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "tmdb", id, type: form.type }),
      });
      const data = (await response.json()) as { ok: boolean; prefill?: Prefill; error?: string };
      if (data.ok && data.prefill) applyPrefill(data.prefill);
      else setImportNote(data.error === "tmdb_unavailable" ? t("tmdbUnavailable") : t("importFailed"));
    } catch {
      setImportNote(t("importFailed"));
    } finally {
      setSearching(false);
    }
  };

  const pickResult = async (result: ImportResult) => {
    setSearching(true);
    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "catalog", id: result.id, type: result.type }),
      });
      const data = (await response.json()) as { ok: boolean; prefill?: Prefill };
      if (data.ok && data.prefill) applyPrefill(data.prefill);
      else setImportNote(t("importFailed"));
    } catch {
      setImportNote(t("importFailed"));
    } finally {
      setSearching(false);
    }
  };

  const payload = useMemo(() => {
    const cleanStreams = streams
      .map((row) => ({
        label: row.label.trim(),
        url: row.url.trim(),
        quality: row.quality,
      }))
      .filter((row) => row.url.length > 0);
    return {
      type: form.type,
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim(),
      overviewAr: form.overviewAr,
      overviewEn: form.overviewEn,
      posterUrl: form.posterUrl.trim() || null,
      backdropUrl: form.backdropUrl.trim() || null,
      trailerUrl: form.trailerUrl.trim() || null,
      year: numberOrNull(form.year),
      rating: numberOrNull(form.rating),
      runtime: numberOrNull(form.runtime),
      seasons: form.type === "tv" ? numberOrNull(form.seasons) ?? 1 : null,
      episodes: form.type === "tv" ? numberOrNull(form.episodes) ?? 1 : null,
      genres: form.genres,
      cast: form.cast
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
      streams: cleanStreams,
      published: form.published,
      featured: form.featured,
    };
  }, [form, streams]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!payload.titleAr && !payload.titleEn) {
      setError(t("requiredTitle"));
      return;
    }
    if (!payload.streams.length) {
      setError(t("requiredStream"));
      return;
    }
    const invalid = payload.streams.some((stream) => {
      try {
        const parsed = new URL(stream.url);
        return parsed.protocol !== "http:" && parsed.protocol !== "https:";
      } catch {
        return true;
      }
    });
    if (invalid) {
      setError(t("invalidUrl"));
      return;
    }

    setPending(true);
    try {
      const response = await fetch(mode === "create" ? "/api/admin/titles" : `/api/admin/titles/${record!.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(t("saveFailed"));
        return;
      }
      setSuccess(mode === "create" ? t("created") : t("updated"));
      router.push("/admin/titles");
      router.refresh();
    } catch {
      setError(t("saveFailed"));
    } finally {
      setPending(false);
    }
  };

  const removeTitle = async () => {
    if (!record) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/titles/${record.id}`, { method: "DELETE" });
      if (!response.ok) {
        setError(t("deleteFailed"));
        return;
      }
      router.push("/admin/titles");
      router.refresh();
    } catch {
      setError(t("deleteFailed"));
    } finally {
      setPending(false);
    }
  };

  const previewPoster = form.posterUrl.trim();

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/titles")}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-gold-300"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t("backToList")}
          </button>
          <h2 className="mt-2 text-2xl font-extrabold">{mode === "create" ? t("newTitle") : t("editTitle")}</h2>
          <p className="mt-1 text-xs text-muted">{t("quickHint")}</p>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && record ? (
            <a href={`/${locale}/title/${record.type}/${record.numericId}`} className="btn-outline !py-2 !text-xs">
              {t("openOnSite")}
            </a>
          ) : null}
          <button type="submit" disabled={pending} className="btn-gold !py-2 !text-xs">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {pending ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-nile-500/40 bg-nile-500/10 px-4 py-3 text-xs font-semibold text-nile-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}
      {success ? (
        <div className="flex items-start gap-2 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-xs font-semibold text-gold-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {success}
        </div>
      ) : null}

      {mode === "create" ? (
        <section className="surface p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Download className="h-4 w-4 text-gold-400" /> {t("importTitle")}
          </h3>
          <p className="mt-1 text-[11px] text-muted">{t("importHint")}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60 start-3" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void runSearch();
                  }
                }}
                placeholder={t("importPlaceholder")}
                className="input ps-10"
              />
            </div>
            <button type="button" onClick={() => void runSearch()} disabled={searching} className="btn-outline !py-2.5 !text-xs">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {t("importSearch")}
            </button>
          </div>

          {results.length > 0 ? (
            <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => void pickResult(result)}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-card/40 p-2 text-start transition hover:border-gold-500/50"
                >
                  {result.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={result.posterUrl} alt="" className="h-14 w-10 shrink-0 rounded object-cover" loading="lazy" />
                  ) : (
                    <span className="grid h-14 w-10 shrink-0 place-items-center rounded bg-bg/60 text-muted">
                      <Film className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-bold">{result.title}</span>
                    <span className="block truncate text-[10px] text-muted">
                      {result.year ?? "—"} · {result.type === "movie" ? t("movie") : t("show")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-line/60 pt-4">
            <div className="min-w-[160px] flex-1">
              <label className="label" htmlFor="tmdb-id">{t("importFromTmdb")}</label>
              <input
                id="tmdb-id"
                value={tmdbId}
                onChange={(event) => setTmdbId(event.target.value)}
                placeholder={t("tmdbIdPlaceholder")}
                inputMode="numeric"
                dir="ltr"
                className="input"
              />
            </div>
            <button type="button" onClick={() => void importFromTmdb()} disabled={searching} className="btn-outline !py-2.5 !text-xs">
              <Download className="h-4 w-4" /> {t("importButton")}
            </button>
            <p className="text-[10px] text-muted/70">{t("importNoKey")}</p>
          </div>

          {importNote ? <p className="mt-3 text-[11px] font-semibold text-gold-300">{importNote}</p> : null}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="surface space-y-4 p-5">
            <h3 className="text-sm font-bold">{t("basicInfo")}</h3>

            <div className="flex gap-2">
              {(["movie", "tv"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => patch("type", type)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition",
                    form.type === type
                      ? "border-gold-500 bg-gold-500/15 text-gold-300"
                      : "border-line bg-card/50 text-muted hover:text-fg",
                  )}
                >
                  {type === "movie" ? <Film className="h-3.5 w-3.5" /> : <Tv className="h-3.5 w-3.5" />}
                  {type === "movie" ? t("movie") : t("show")}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="title-ar">{t("titleAr")}</label>
                <input
                  id="title-ar"
                  value={form.titleAr}
                  onChange={(event) => patch("titleAr", event.target.value)}
                  className="input"
                  dir="rtl"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="label" htmlFor="title-en">{t("titleEn")}</label>
                <input
                  id="title-en"
                  value={form.titleEn}
                  onChange={(event) => patch("titleEn", event.target.value)}
                  className="input"
                  dir="ltr"
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="year">{t("year")}</label>
                  <input
                    id="year"
                    value={form.year}
                    onChange={(event) => patch("year", event.target.value)}
                    className="input"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="2025"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="rating">{t("rating")}</label>
                  <input
                    id="rating"
                    value={form.rating}
                    onChange={(event) => patch("rating", event.target.value)}
                    className="input"
                    inputMode="decimal"
                    dir="ltr"
                    placeholder="8.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="runtime">{t("runtime")}</label>
                  <input
                    id="runtime"
                    value={form.runtime}
                    onChange={(event) => patch("runtime", event.target.value)}
                    className="input"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="120"
                  />
                </div>
                {form.type === "tv" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label" htmlFor="seasons">{t("seasons")}</label>
                      <input
                        id="seasons"
                        value={form.seasons}
                        onChange={(event) => patch("seasons", event.target.value)}
                        className="input"
                        inputMode="numeric"
                        dir="ltr"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="episodes">{t("episodes")}</label>
                      <input
                        id="episodes"
                        value={form.episodes}
                        onChange={(event) => patch("episodes", event.target.value)}
                        className="input"
                        inputMode="numeric"
                        dir="ltr"
                        placeholder="10"
                      />
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </section>

          <section className="surface space-y-4 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <ImageIcon className="h-4 w-4 text-gold-400" /> {t("artwork")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="poster">{t("posterUrl")}</label>
                <input
                  id="poster"
                  value={form.posterUrl}
                  onChange={(event) => patch("posterUrl", event.target.value)}
                  className="input"
                  dir="ltr"
                  placeholder="https://image.tmdb.org/t/p/w500/…"
                />
              </div>
              <div>
                <label className="label" htmlFor="backdrop">{t("backdropUrl")}</label>
                <input
                  id="backdrop"
                  value={form.backdropUrl}
                  onChange={(event) => patch("backdropUrl", event.target.value)}
                  className="input"
                  dir="ltr"
                  placeholder="https://…"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="trailer">{t("trailerUrl")}</label>
              <input
                id="trailer"
                value={form.trailerUrl}
                onChange={(event) => patch("trailerUrl", event.target.value)}
                className="input"
                dir="ltr"
                placeholder="https://www.youtube.com/watch?v=…"
              />
            </div>
          </section>

          <section className="surface space-y-4 p-5">
            <h3 className="text-sm font-bold">{t("story")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="overview-ar">{t("overviewAr")}</label>
                <textarea
                  id="overview-ar"
                  value={form.overviewAr}
                  onChange={(event) => patch("overviewAr", event.target.value)}
                  className="input min-h-[110px] resize-y"
                  dir="rtl"
                  maxLength={4000}
                />
              </div>
              <div>
                <label className="label" htmlFor="overview-en">{t("overviewEn")}</label>
                <textarea
                  id="overview-en"
                  value={form.overviewEn}
                  onChange={(event) => patch("overviewEn", event.target.value)}
                  className="input min-h-[110px] resize-y"
                  dir="ltr"
                  maxLength={4000}
                />
              </div>
            </div>

            <div>
              <span className="label">{t("genres")}</span>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => {
                  const active = form.genres.includes(genre.slug);
                  return (
                    <button
                      key={genre.slug}
                      type="button"
                      onClick={() => toggleGenre(genre.slug)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                        active
                          ? "border-gold-500 bg-gold-500/15 text-gold-300"
                          : "border-line bg-card/50 text-muted hover:text-fg",
                      )}
                    >
                      {genre.emoji} {locale === "ar" ? genre.ar : genre.en}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="cast">{t("cast")}</label>
              <input
                id="cast"
                value={form.cast}
                onChange={(event) => patch("cast", event.target.value)}
                className="input"
                placeholder={t("castHint")}
              />
            </div>
          </section>

          <section className="surface space-y-4 p-5">
            <h3 className="text-sm font-bold">{t("playback")}</h3>
            <p className="text-[11px] leading-6 text-muted">{t("streamHint")}</p>

            <div className="space-y-3">
              {streams.map((stream, index) => (
                <div key={index} className="grid gap-2 rounded-xl border border-line/70 bg-bg/30 p-3 sm:grid-cols-[140px_92px_1fr_36px]">
                  <input
                    value={stream.label}
                    onChange={(event) => updateStream(index, { label: event.target.value })}
                    placeholder={t("streamLabel")}
                    className="input !py-2 !text-[11px]"
                    maxLength={40}
                  />
                  <select
                    value={stream.quality}
                    onChange={(event) => updateStream(index, { quality: event.target.value })}
                    className="input !py-2 !text-[11px]"
                    aria-label={t("streamQuality")}
                  >
                    {QUALITIES.map((quality) => (
                      <option key={quality} value={quality}>
                        {quality}
                      </option>
                    ))}
                  </select>
                  <input
                    value={stream.url}
                    onChange={(event) => updateStream(index, { url: event.target.value })}
                    placeholder="https://…"
                    className="input !py-2 !text-[11px]"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setStreams((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)))}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:border-nile-500/50 hover:text-nile-300"
                    aria-label={t("removeStream")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStreams((current) => [...current, { label: "", url: "", quality: "HD" }])}
              className="btn-outline !py-2 !text-[11px]"
            >
              <Plus className="h-3.5 w-3.5" /> {t("addStream")}
            </button>

            <p className="text-[10px] text-muted/60">
              {t("qualityHint")} · {t("streamsFormHint")}
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted/70">{t("preview")}</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-line bg-bg">
              <div className="relative aspect-[2/3] w-full bg-night-900">
                {previewPoster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewPoster} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-muted">
                    <Film className="h-8 w-8" />
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold">{form.titleAr || form.titleEn || "—"}</p>
                <p className="mt-1 flex items-center gap-2 text-[10px] text-muted">
                  <span>{form.year || "—"}</span>
                  <span className="inline-flex items-center gap-1 text-gold-300">
                    <Star className="h-3 w-3 fill-current" /> {form.rating || "—"}
                  </span>
                  <span>{form.type === "movie" ? t("movie") : t("show")}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="surface space-y-3 p-5">
            <h3 className="text-sm font-bold">{t("visibility")}</h3>
            <label className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => patch("published", event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
              />
              <span>
                <span className="font-semibold">{t("published")}</span>
                <span className="mt-0.5 block text-[10px] text-muted">{t("publishedHint")}</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => patch("featured", event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
              />
              <span>
                <span className="font-semibold">{t("featured")}</span>
                <span className="mt-0.5 block text-[10px] text-muted">{t("featuredHint")}</span>
              </span>
            </label>
          </div>

          <div className="surface space-y-3 p-5">
            <button type="submit" disabled={pending} className="btn-gold w-full !py-2.5 !text-xs">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {pending ? t("saving") : common("save")}
            </button>
            {mode === "edit" && record ? (
              <button
                type="button"
                onClick={() => void removeTitle()}
                disabled={pending}
                className="btn-outline w-full !py-2.5 !text-xs !text-nile-300"
              >
                <Trash2 className="h-4 w-4" /> {t("delete")}
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  );
}

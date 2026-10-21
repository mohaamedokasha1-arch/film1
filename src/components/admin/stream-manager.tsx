"use client";

import { useState } from "react";
import { CheckCircle2, Link2, Loader2, Plus, ServerCog, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { MediaType, StreamSourceRecord } from "@/types";

const QUALITIES = ["HD", "FHD", "4K"];

export function StreamManager({ initialSources }: { initialSources: StreamSourceRecord[] }) {
  const t = useTranslations("studio");
  const router = useRouter();

  const [sources, setSources] = useState<StreamSourceRecord[]>(initialSources);
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [tmdbId, setTmdbId] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("HD");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsedId = Number(tmdbId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setError(t("notFound"));
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("bad");
    } catch {
      setError(t("invalidUrl"));
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/admin/streams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mediaType, tmdbId: parsedId, label, url, quality }),
      });
      const data = (await response.json()) as { ok: boolean; source?: StreamSourceRecord; error?: string };
      if (!response.ok || !data.ok || !data.source) {
        setError(t("saveFailed"));
        return;
      }
      setSources((current) => [data.source!, ...current.filter((entry) => entry.id !== data.source!.id)]);
      setUrl("");
      setLabel("");
      setTmdbId("");
      setMessage(t("serverAdded"));
      router.refresh();
    } catch {
      setError(t("saveFailed"));
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/admin/streams/${id}`, { method: "DELETE" });
      setSources((current) => current.filter((entry) => entry.id !== id));
      setMessage(t("serverDeleted"));
      router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="surface space-y-4 p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Plus className="h-4 w-4 text-gold-400" /> {t("addServer")}
        </h3>
        <p className="text-[11px] leading-6 text-muted">{t("streamsFormHint")}</p>

        <div className="grid gap-3 lg:grid-cols-[130px_140px_1fr_100px_1fr_auto]">
          <div>
            <label className="label" htmlFor="stream-type">{t("mediaType")}</label>
            <select
              id="stream-type"
              value={mediaType}
              onChange={(event) => setMediaType(event.target.value as MediaType)}
              className="input !py-2 !text-[11px]"
            >
              <option value="movie">{t("movie")}</option>
              <option value="tv">{t("show")}</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="stream-tmdb">{t("tmdbId")}</label>
            <input
              id="stream-tmdb"
              value={tmdbId}
              onChange={(event) => setTmdbId(event.target.value)}
              inputMode="numeric"
              dir="ltr"
              placeholder="155"
              className="input !py-2 !text-[11px]"
            />
          </div>
          <div>
            <label className="label" htmlFor="stream-label">{t("streamLabel")}</label>
            <input
              id="stream-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={40}
              placeholder="My server"
              className="input !py-2 !text-[11px]"
            />
          </div>
          <div>
            <label className="label" htmlFor="stream-quality">{t("streamQuality")}</label>
            <select
              id="stream-quality"
              value={quality}
              onChange={(event) => setQuality(event.target.value)}
              className="input !py-2 !text-[11px]"
            >
              {QUALITIES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="stream-url">{t("streamUrl")}</label>
            <input
              id="stream-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              dir="ltr"
              placeholder="https://…/embed/{season}/{episode}"
              className="input !py-2 !text-[11px]"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={pending} className="btn-gold !py-2.5 !text-[11px]">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              {t("addServer")}
            </button>
          </div>
        </div>

        {error ? <p className="text-[11px] font-semibold text-nile-300">{error}</p> : null}
        {message ? (
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> {message}
          </p>
        ) : null}
      </form>

      <div className="surface overflow-x-auto">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <ServerCog className="h-4 w-4 text-gold-400" /> {t("existingStreams")}
          </h3>
          <span className="text-[10px] text-muted/60">{t("overrideHint")}</span>
        </div>

        {sources.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-muted">{t("noOverrides")}</p>
        ) : (
          <table className="w-full min-w-[720px] text-start text-xs">
            <thead className="border-b border-line text-[10px] uppercase tracking-widest text-muted/60">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("type")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("tmdbId")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("streamLabel")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("streamUrl")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("streamQuality")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("remove")}</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id} className="border-b border-line/40 last:border-0">
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-muted">
                      {source.mediaType === "movie" ? t("movie") : t("show")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted" dir="ltr">
                    {source.tmdbId}
                  </td>
                  <td className="px-4 py-3 font-semibold">{source.label}</td>
                  <td className="max-w-[280px] px-4 py-3">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="block truncate font-mono text-[10px] text-muted/80 transition hover:text-gold-300"
                    >
                      {source.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[9px] font-bold text-gold-300">
                      {source.quality ?? "HD"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => void remove(source.id)}
                        disabled={deleting === source.id}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:border-nile-500/50 hover:text-nile-300"
                        aria-label={t("remove")}
                      >
                        {deleting === source.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

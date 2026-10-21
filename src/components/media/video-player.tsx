"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buildEmbedUrl, playerSandbox, streamProviders } from "@/config/players";
import type { MediaType } from "@/types";
import { cn } from "@/lib/utils";

export function VideoPlayer({
  tmdbId,
  mediaType,
  title,
  season = 1,
  episode = 1,
}: {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  season?: number;
  episode?: number;
}) {
  const t = useTranslations("player");
  const locale = useLocale();
  const [providerId, setProviderId] = useState(streamProviders[0].id);
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportPending, setReportPending] = useState(false);

  const provider = useMemo(
    () => streamProviders.find((entry) => entry.id === providerId) ?? streamProviders[0],
    [providerId],
  );
  const url = buildEmbedUrl(provider, mediaType, tmdbId, season, episode);

  const switchProvider = (id: string) => {
    setProviderId(id);
    setLoaded(false);
    setReloadKey((value) => value + 1);
  };

  const submitReport = async () => {
    setReportPending(true);
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType, season, episode, provider: provider.id, message: reportText }),
      });
      setReportSent(true);
    } catch {
      setReportSent(true);
    } finally {
      setReportPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted/70">{t("servers")}</span>
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          {streamProviders.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchProvider(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                item.id === provider.id
                  ? "border-gold-500 bg-gold-500/15 text-gold-300"
                  : "border-line bg-card/50 text-muted hover:border-gold-500/50 hover:text-fg",
              )}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-bg/70 text-[9px] font-bold">
                {index + 1}
              </span>
              {item.name}
              <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[8px] font-bold text-gold-300">{item.quality}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-line bg-black shadow-card">
        <div className="relative aspect-video w-full">
          {!loaded && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-night-950/90">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-7 w-7 animate-spin text-gold-400" />
                <p className="text-xs text-muted">{t("loadingPlayer")}</p>
                <p className="max-w-sm text-[10px] text-muted/60">{t("playerHint")}</p>
              </div>
            </div>
          )}
          <iframe
            key={`${provider.id}-${reloadKey}`}
            src={url}
            title={`${title} — ${provider.name}`}
            className="h-full w-full"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="origin"
            sandbox={playerSandbox}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoaded(false);
              setReloadKey((value) => value + 1);
            }}
            className="btn-ghost !px-3 !py-1.5 !text-[11px]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {locale === "ar" ? "إعادة التحميل" : "Reload"}
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !py-1.5 !text-[11px]">
            <ExternalLink className="h-3.5 w-3.5" /> {t("openServer")}
          </a>
          <button
            type="button"
            onClick={() => {
              setReportOpen(true);
              setReportSent(false);
            }}
            className="btn-ghost !px-3 !py-1.5 !text-[11px]"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> {t("reportTitle")}
          </button>
        </div>
        <p className="inline-flex items-center gap-1.5 text-[10px] text-muted/60">
          <ShieldAlert className="h-3.5 w-3.5" /> {t("warning")}
        </p>
      </div>

      <p className="rounded-xl border border-line/70 bg-card/40 px-4 py-3 text-[11px] leading-6 text-muted">
        {t("externalHint")}
      </p>

      <Dialog.Root open={reportOpen} onOpenChange={setReportOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-card p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-base font-bold">{t("reportTitle")}</Dialog.Title>
                <Dialog.Description className="mt-2 text-xs leading-6 text-muted">{t("reportBody")}</Dialog.Description>
              </div>
              <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted hover:text-fg">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {reportSent ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-xs font-semibold text-gold-300">
                <CheckCircle2 className="h-4 w-4" /> {t("reportSuccess")}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <textarea
                  value={reportText}
                  onChange={(event) => setReportText(event.target.value)}
                  placeholder={t("reportPlaceholder")}
                  rows={3}
                  maxLength={500}
                  className="input resize-none"
                />
                <button type="button" onClick={submitReport} disabled={reportPending} className="btn-gold w-full">
                  {reportPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("reportSubmit")}
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

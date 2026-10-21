"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Play, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function TrailerDialog({ trailerKey, title }: { trailerKey: string; title: string }) {
  const t = useTranslations("media");
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="btn-outline">
          <Play className="h-4 w-4" /> {t("watchTrailer")}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(92vw,1100px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line bg-night-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
            <Dialog.Title className="truncate pe-4 text-sm font-bold text-white">
              {title} — {t("trailer")}
            </Dialog.Title>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">{t("trailer")}</span>
            </Dialog.Close>
          </div>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

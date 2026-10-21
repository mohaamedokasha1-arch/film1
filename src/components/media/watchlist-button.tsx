"use client";

import { useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { MediaType } from "@/types";
import { cn } from "@/lib/utils";

export interface WatchlistItemInput {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  rating: number | null;
  releaseDate: string | null;
}

export function WatchlistButton({
  item,
  initial = false,
  variant = "icon",
  className,
}: {
  item: WatchlistItemInput;
  initial?: boolean;
  variant?: "icon" | "button";
  className?: string;
}) {
  const t = useTranslations("media");
  const locale = useLocale();
  const router = useRouter();
  const [active, setActive] = useState(initial);
  const [pending, setPending] = useState(false);

  const toggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item),
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = (await response.json()) as { ok?: boolean; inWatchlist?: boolean };
      if (data.ok) setActive(Boolean(data.inWatchlist));
    } catch {
      /* network hiccup: keep the previous state */
    } finally {
      setPending(false);
    }
  };

  const label = active ? t("removeFromWatchlist") : t("addToWatchlist");

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "btn-outline",
          active && "border-gold-500/70 text-gold-300",
          className,
        )}
        aria-pressed={active}
        aria-label={label}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {active ? t("inWatchlist") : t("addToWatchlist")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur transition hover:scale-110 hover:border-gold-400 hover:bg-black/75",
        active && "border-gold-400 text-gold-300",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : active ? (
        <Check className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </button>
  );
}

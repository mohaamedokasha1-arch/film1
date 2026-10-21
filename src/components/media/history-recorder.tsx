"use client";

import { useEffect, useRef } from "react";
import type { MediaType } from "@/types";

export function HistoryRecorder({
  tmdbId,
  mediaType,
  title,
  posterPath,
  season,
  episode,
  duration,
  progress = 5,
}: {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  season?: number | null;
  episode?: number | null;
  duration?: number | null;
  progress?: number;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const payload = { tmdbId, mediaType, title, posterPath, season, episode, duration, progress };
    fetch("/api/history", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, [tmdbId, mediaType, title, posterPath, season, episode, duration, progress]);

  return null;
}

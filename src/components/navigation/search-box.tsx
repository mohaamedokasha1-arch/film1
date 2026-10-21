"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2, X, Film, Tv } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { posterUrl, cn, getYear } from "@/lib/utils";

interface Suggestion {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  rating: number;
}

export function SearchBox({
  variant = "inline",
  onNavigate,
}: {
  variant?: "inline" | "overlay";
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const searchT = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { items?: Suggestion[] };
        setItems(data.items ?? []);
        setOpen(true);
      } catch {
        /* ignored: aborted request */
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, locale]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setOpen(false);
    onNavigate?.();
    router.push({ pathname: "/search", query: { q: value } });
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", variant === "inline" && "max-w-[280px]")}>
      <form onSubmit={submit} role="search">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border bg-card/60 px-3.5 transition",
            focused ? "border-gold-500/60 ring-2 ring-gold-500/15" : "border-line",
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setFocused(true);
              if (items.length) setOpen(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
            placeholder={t("search")}
            aria-label={t("search")}
            className="h-10 w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted/70"
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setItems([]);
              }}
              aria-label="clear"
              className="text-muted transition hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          {items.length === 0 && !loading ? (
            <p className="px-4 py-6 text-center text-xs text-muted">{searchT("noResultsTitle")}</p>
          ) : (
            <ul className="max-h-[60vh] overflow-auto py-1">
              {items.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link
                    href={`/title/${item.type}/${item.id}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-bg/60"
                  >
                    <span className="relative block h-14 w-10 shrink-0 overflow-hidden rounded-md bg-bg">
                      {item.posterPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={posterUrl(item.posterPath, "w185") ?? ""}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-muted">
                          {item.type === "movie" ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-fg">{item.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                        {getYear(item.releaseDate) ?? "—"}
                        <span className="text-line">•</span>
                        {item.type === "movie" ? searchT("types.movie") : searchT("types.tv")}
                        {item.rating > 0 && (
                          <>
                            <span className="text-line">•</span>
                            <span className="text-gold-400">★ {item.rating.toFixed(1)}</span>
                          </>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={submit}
            className="block w-full border-t border-line bg-bg/40 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-widest text-gold-400 transition hover:bg-bg/70"
          >
            {searchT("viewAllResults")}
          </button>
        </div>
      )}
    </div>
  );
}

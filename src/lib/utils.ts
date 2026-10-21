import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null | undefined, size: "w185" | "w342" | "w500" | "w780" = "w500") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null | undefined, size: "w780" | "w1280" | "original" = "w1280") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/w185${path}`;
}

export function formatRuntime(minutes: number | null | undefined, locale: string) {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (locale === "ar") {
    if (hours === 0) return `${rest} دقيقة`;
    if (rest === 0) return `${hours} ساعة`;
    return `${hours} ساعة و${rest} دقيقة`;
  }
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours}h ${rest}m`;
}

export function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getYear(value: string | null | undefined) {
  if (!value) return null;
  const year = value.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US").format(value);
}

export function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : "–";
}

export function paginate<T>(items: T[], page = 1, pageSize = 24) {
  const safePage = Math.max(1, Math.floor(page));
  const totalResults = items.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalResults,
  };
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function clampPage(value: string | string[] | undefined, max = 500) {
  const raw = Number(firstParam(value));
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(Math.floor(raw), max);
}

export function plural(locale: string, count: number, one: string, many: string) {
  return count === 1 ? one : many;
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://farja.app";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

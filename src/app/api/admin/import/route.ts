import { NextResponse } from "next/server";
import { badRequest, requireAdmin, serverError } from "@/lib/admin-api";
import { hasTmdbCredentials, tmdbDetails, tmdbSearch } from "@/lib/tmdb";
import { catalogTitles, findCatalogTitle } from "@/lib/catalog";
import type { MediaType, Title } from "@/types";
import { backdropUrl, posterUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseType(value: unknown): MediaType | null {
  return value === "movie" || value === "tv" ? value : null;
}

const HAS_ARABIC = /[\u0600-\u06FF]/;

/** A compact result row for the picker. */
function toSearchResult(title: Title) {
  return {
    id: title.id,
    type: title.type,
    title: title.title,
    originalTitle: title.originalTitle,
    year: title.releaseDate?.slice(0, 4) ?? null,
    posterUrl: posterUrl(title.posterPath, "w185"),
    rating: title.rating,
  };
}

function toPrefill(title: Title, type: MediaType) {
  const arabicTitle = HAS_ARABIC.test(title.originalTitle) ? title.originalTitle : title.title;
  const englishTitle = HAS_ARABIC.test(title.originalTitle) ? title.title : title.originalTitle || title.title;
  return {
    type,
    titleAr: arabicTitle,
    titleEn: englishTitle,
    overviewAr: "",
    overviewEn: title.overview ?? "",
    posterUrl: posterUrl(title.posterPath, "w500"),
    backdropUrl: backdropUrl(title.backdropPath, "w1280"),
    trailerUrl: title.trailerKey ? `https://www.youtube.com/watch?v=${title.trailerKey}` : null,
    year: title.releaseDate ? Number(title.releaseDate.slice(0, 4)) : null,
    rating: title.rating || null,
    runtime: title.runtime ?? null,
    genres: title.genreSlugs ?? [],
    cast: (title.cast ?? []).slice(0, 12).map((member) => member.name),
    seasons: title.seasons ?? null,
    episodes: title.episodes ?? null,
  };
}

/**
 * POST /api/admin/import
 *  { source: "catalog" | "tmdb", query }        -> search results
 *  { source: "catalog" | "tmdb", id, type }     -> pre-filled form values
 */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const source = body.source === "tmdb" ? "tmdb" : "catalog";
    const query = String(body.query ?? "").trim();
    const id = Number(body.id);
    const type = parseType(body.type);

    if (source === "tmdb" && !hasTmdbCredentials()) {
      return NextResponse.json({ ok: false, error: "tmdb_unavailable" }, { status: 400 });
    }

    if (Number.isInteger(id) && id > 0) {
      if (!type) return badRequest("invalid_type");

      if (source === "catalog") {
        const title = findCatalogTitle(type, id);
        if (!title) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
        return NextResponse.json({ ok: true, prefill: toPrefill(title, type) });
      }

      const [ar, en] = await Promise.all([
        tmdbDetails(type, id, "ar").catch(() => null),
        tmdbDetails(type, id, "en").catch(() => null),
      ]);
      if (!ar && !en) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

      const base = toPrefill((ar ?? en)!.detail, type);
      return NextResponse.json({
        ok: true,
        prefill: {
          ...base,
          titleAr: ar?.detail.title || base.titleAr,
          titleEn: en?.detail.title || base.titleEn,
          overviewAr: ar?.detail.overview || base.overviewAr,
          overviewEn: en?.detail.overview || base.overviewEn,
        },
      });
    }

    if (query.length < 2) return badRequest("query_short");

    if (source === "tmdb") {
      const result = await tmdbSearch(query, "ar", 1);
      return NextResponse.json({ ok: true, results: result.items.slice(0, 10).map(toSearchResult) });
    }

    const needle = query.toLowerCase();
    const results = catalogTitles
      .filter((title) => `${title.title} ${title.originalTitle}`.toLowerCase().includes(needle))
      .slice(0, 12)
      .map(toSearchResult);
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return serverError(error, "admin import");
  }
}

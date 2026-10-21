import { NextResponse } from "next/server";
import { getSuggestions } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").slice(0, 80);
  const locale = url.searchParams.get("locale") === "en" ? "en" : "ar";

  if (query.trim().length < 2) return NextResponse.json({ ok: true, items: [] });

  try {
    const items = await getSuggestions(query, locale, 8);
    return NextResponse.json({
      ok: true,
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        posterPath: item.posterPath,
        releaseDate: item.releaseDate,
        rating: item.rating,
      })),
    });
  } catch (error) {
    console.error("[farja] search API failed:", error);
    return NextResponse.json({ ok: true, items: [] });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSeeded, getStore } from "@/lib/store";
import type { MediaType } from "@/types";

export const runtime = "nodejs";

function parseMediaType(value: unknown): MediaType | null {
  return value === "movie" || value === "tv" ? value : null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const store = await getStore();
    const items = await store.getHistory(session.user.id, 40);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("[farja] history GET failed:", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tmdbId = Number(body.tmdbId);
    const mediaType = parseMediaType(body.mediaType);
    const title = String(body.title ?? "").trim().slice(0, 200);
    if (!Number.isInteger(tmdbId) || tmdbId <= 0 || !mediaType || !title) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const season = Number.isInteger(Number(body.season)) ? Number(body.season) : null;
    const episode = Number.isInteger(Number(body.episode)) ? Number(body.episode) : null;
    const progress = Math.min(100, Math.max(0, Number(body.progress) || 5));

    await ensureSeeded();
    const store = await getStore();
    await store.upsertHistory(session.user.id, {
      tmdbId,
      mediaType,
      title,
      posterPath: typeof body.posterPath === "string" ? body.posterPath : null,
      season,
      episode,
      progress,
      duration: Number.isFinite(Number(body.duration)) ? Number(body.duration) : null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[farja] history POST failed:", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    const tmdbId = Number(url.searchParams.get("tmdbId"));
    const mediaType = parseMediaType(url.searchParams.get("mediaType"));
    if (!Number.isInteger(tmdbId) || !mediaType) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const store = await getStore();
    await store.removeHistory(session.user.id, tmdbId, mediaType);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[farja] history DELETE failed:", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

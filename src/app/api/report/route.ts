import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Player issue reports.
 * Currently they are validated and logged on the server; wire this endpoint to
 * your issue tracker (Sentry, GitHub, Slack webhook…) when you need persistence.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tmdbId = Number(body.tmdbId);
    const message = String(body.message ?? "").slice(0, 500);
    console.info("[farja] player report", {
      tmdbId: Number.isFinite(tmdbId) ? tmdbId : null,
      mediaType: body.mediaType,
      season: body.season,
      episode: body.episode,
      provider: body.provider,
      message,
      at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

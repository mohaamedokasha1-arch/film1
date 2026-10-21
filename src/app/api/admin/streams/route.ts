import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { badRequest, requireAdmin, serverError } from "@/lib/admin-api";
import { listStreamSources } from "@/lib/custom";
import { getStore } from "@/lib/store";
import type { MediaType, StreamSourceInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseType(value: string | null): MediaType | undefined {
  return value === "movie" || value === "tv" ? value : undefined;
}

/** GET /api/admin/streams?type=movie&tmdbId=155 */
export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const url = new URL(request.url);
    const tmdbId = Number(url.searchParams.get("tmdbId"));
    const sources = await listStreamSources(
      parseType(url.searchParams.get("type")),
      Number.isInteger(tmdbId) && tmdbId > 0 ? tmdbId : undefined,
    );
    return NextResponse.json({ ok: true, sources });
  } catch (error) {
    return serverError(error, "admin streams GET");
  }
}

/** POST /api/admin/streams — attach a playback link to any TMDB title. */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await request.json()) as Partial<StreamSourceInput>;
    if (!body.mediaType || !body.url) return badRequest("invalid_payload");

    const store = await getStore();
    const source = await store.addStreamSource(body as StreamSourceInput);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, source }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && ["invalid_type", "invalid_tmdb_id", "invalid_url"].includes(error.message)) {
      return badRequest(error.message);
    }
    return serverError(error, "admin streams POST");
  }
}

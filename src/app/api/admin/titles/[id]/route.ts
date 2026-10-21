import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { badRequest, requireAdmin, serverError } from "@/lib/admin-api";
import { getStore } from "@/lib/store";
import type { CustomTitleInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/titles/[id] */
export async function GET(_request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const store = await getStore();
    const title = await store.findCustomTitle(id);
    if (!title) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, title });
  } catch (error) {
    return serverError(error, "admin title GET");
  }
}

/** PATCH /api/admin/titles/[id] — partial update (used by the edit form). */
export async function PATCH(request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<CustomTitleInput>;
    const store = await getStore();
    const current = await store.findCustomTitle(id);
    if (!current) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    const merged = { ...current, ...body } as CustomTitleInput;
    if (!String(merged.titleAr ?? "").trim() && !String(merged.titleEn ?? "").trim()) {
      return badRequest("title_required");
    }
    if (!Array.isArray(merged.streams) || merged.streams.length === 0) {
      return badRequest("stream_required");
    }

    const title = await store.updateCustomTitle(id, body);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, title });
  } catch (error) {
    return serverError(error, "admin title PATCH");
  }
}

/** DELETE /api/admin/titles/[id] */
export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const store = await getStore();
    await store.deleteCustomTitle(id);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error, "admin title DELETE");
  }
}

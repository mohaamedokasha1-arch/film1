import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, serverError } from "@/lib/admin-api";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/admin/streams/[id] */
export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const store = await getStore();
    await store.removeStreamSource(id);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error, "admin stream DELETE");
  }
}

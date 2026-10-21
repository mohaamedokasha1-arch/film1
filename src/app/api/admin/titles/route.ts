import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { badRequest, requireAdmin, serverError } from "@/lib/admin-api";
import { listAllCustomTitles } from "@/lib/custom";
import { getStore } from "@/lib/store";
import { validateCustomInput } from "@/lib/store/custom-helpers";
import type { CustomTitleInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/titles — every dashboard title, drafts included. */
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const titles = await listAllCustomTitles();
    return NextResponse.json({ ok: true, titles });
  } catch (error) {
    return serverError(error, "admin titles GET");
  }
}

/** POST /api/admin/titles — add a title by link. */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await request.json()) as Partial<CustomTitleInput>;
    const invalid = validateCustomInput(body as CustomTitleInput);
    if (invalid) return badRequest(invalid);

    const store = await getStore();
    const title = await store.createCustomTitle(body as CustomTitleInput);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, title }, { status: 201 });
  } catch (error) {
    return serverError(error, "admin titles POST");
  }
}

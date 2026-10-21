import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Guard for the dashboard REST endpoints.
 * Returns a ready-to-send error response when the caller is not an admin.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { response: null, session };
}

export function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export function serverError(error: unknown, scope: string) {
  console.error(`[farja] ${scope} failed:`, error);
  return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
}

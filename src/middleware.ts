import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const protectedPrefixes = ["/account", "/admin"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/(ar|en)(\/.*)?$/);

  // Redirect anonymous visitors before rendering so protected pages answer with a
  // real 307 instead of a streamed client-side redirect. The layouts still verify
  // the session (and the admin role) server-side.
  if (match) {
    const locale = match[1];
    const rest = match[2] || "/";
    const isProtected = protectedPrefixes.some((prefix) => rest === prefix || rest.startsWith(`${prefix}/`));
    if (isProtected) {
      const token =
        request.cookies.get("authjs.session-token") ??
        request.cookies.get("__Secure-authjs.session-token");
      if (!token) {
        const url = new URL(`/${locale}/login`, request.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip API routes, Next internals and static assets
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

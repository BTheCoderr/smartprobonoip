import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/smartprobonoip/smartprobonoip" ||
    pathname.startsWith("/smartprobonoip/smartprobonoip/")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.next();
  const host = request.nextUrl.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  applySecurityHeaders(response.headers, { includeHsts: !isLocal });
  return response;
}

export const config = {
  matcher: [
    /*
     * Apply security headers to app routes; skip Next internals and static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

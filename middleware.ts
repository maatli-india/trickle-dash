import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "trickle_dash_session";

function isSessionValid(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    const session = JSON.parse(raw) as { expiresAt?: number };
    return typeof session.expiresAt === "number" && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const valid = isSessionValid(request.cookies.get(COOKIE_NAME)?.value);

  if (pathname.startsWith("/dashboard") && !valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (pathname === "/login" && valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

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

// Next.js automatically applies a nonce it finds in this exact
// Content-Security-Policy response header to its own emitted <script>
// tags, so this is enough to lock script-src down without threading a
// nonce prop through every page by hand. This is an internal admin
// dashboard with no payment/checkout forms, so (unlike trickle-web)
// form-action is locked to 'self' too.
function buildCSP(): { nonce: string; csp: string } {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
  return { nonce, csp };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const valid = isSessionValid(request.cookies.get(COOKIE_NAME)?.value);
  const { nonce, csp } = buildCSP();

  if (pathname.startsWith("/dashboard") && !valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }
  if (pathname === "/login" && valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const response = NextResponse.redirect(url);
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Every page/route except static assets and image optimization files.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

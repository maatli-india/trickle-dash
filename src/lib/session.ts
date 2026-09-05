import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "trickle_dash_session";

export type Session = {
  accessToken: string;
  username: string;
  role: string;
  expiresAt: number;
};

// Admin tokens are stateless with no refresh flow (see
// authSessionManager.createAdminAccessToken in the backend) — this cookie
// is just where the browser session keeps that same short-lived token.
// httpOnly so client-side JS (and so the browser extensions / XSS surface)
// never sees the bearer token directly.
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (!session.accessToken || !session.expiresAt || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const store = await cookies();
  const maxAge = Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000));
  store.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

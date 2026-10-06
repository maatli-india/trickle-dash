import "server-only";
import { getSession } from "./session";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:7003/trickle";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// The backend always returns JSON, but if the wrong thing is listening on
// API_BASE_URL (stale process, wrong port, a proxy's own error page) the
// body can be plain text — e.g. Go's default "404 page not found". Parsing
// that as JSON throws confusingly ("404" parses as a number, then chokes on
// "page"), which then surfaced as a raw stack trace instead of a usable
// error. Parse defensively and fall back to the raw text.
function safeParseJSON(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractMessage(data: unknown, text: string, status: number): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
  }
  if (text && data === null) {
    // Non-JSON body — most likely the backend isn't the thing answering at
    // API_BASE_URL right now (stale process, wrong port, needs a restart).
    return `Backend returned a non-JSON response (status ${status}): ${text.slice(0, 200)}`;
  }
  return `Request failed (${status})`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = await getSession();
  if (!session) throw new ApiError("Not authenticated", 401);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Device-ID": "trickle-dash",
      Authorization: `Bearer ${session.accessToken}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  const text = await res.text();
  const data = safeParseJSON(text);

  if (!res.ok) {
    throw new ApiError(extractMessage(data, text, res.status), res.status);
  }
  return data as T;
}

/** Unauthenticated request — only for the admin login endpoint. */
export async function publicPost<T>(path: string, body?: unknown): Promise<{ ok: true; data: T } | { ok: false; message: string; status: number }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Device-ID": "trickle-dash" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  const data = safeParseJSON(text);
  if (!res.ok) {
    return { ok: false, message: extractMessage(data, text, res.status), status: res.status };
  }
  return { ok: true, data: data as T };
}

// Image resolution. Both backend routes answer with a real HTTP 302 to the
// actual Kosh URL — fetch() here uses redirect:"manual" so we can read the
// Location header and hand it to the browser directly (via NextResponse.
// redirect in the route handlers that call these) instead of following it
// ourselves and trying to parse image bytes as JSON.

/** Admin-only: resolves ANY file by id (parcel image, report attachment, ...) via /v1/admin/files. No ownership/fileType check — see AdminDownloadURL on the backend. */
export async function resolveAdminFileURL(fileId: string): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const res = await fetch(`${API_BASE_URL}/v1/admin/files/${fileId}/download-url`, {
    headers: { "X-Device-ID": "trickle-dash", Authorization: `Bearer ${session.accessToken}` },
    redirect: "manual",
    cache: "no-store",
  });
  if (res.status >= 300 && res.status < 400) {
    return res.headers.get("location");
  }
  return null;
}

/** Public: resolves a user's profile picture via the backend's public (no-auth) profile-pic-url route. */
export async function resolvePublicProfilePicURL(userId: string): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/v1/users/${userId}/profile-pic-url`, {
    headers: { "X-Device-ID": "trickle-dash" },
    redirect: "manual",
    cache: "no-store",
  });
  if (res.status >= 300 && res.status < 400) {
    return res.headers.get("location");
  }
  return null;
}

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
export const apiPatch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined });
export const apiDelete = <T>(path: string) => request<T>(path, { method: "DELETE" });

import { NextResponse } from "next/server";
import { resolvePublicProfilePicURL } from "@/lib/api";

// Lets the dashboard use a plain <img src="/api/images/profile/{userId}">
// without exposing the backend's internal API_BASE_URL to the browser —
// this route resolves it server-side and redirects straight to Kosh.
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const url = await resolvePublicProfilePicURL(userId);
  if (!url) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.redirect(url);
}

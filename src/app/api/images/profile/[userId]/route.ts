import { NextResponse } from "next/server";
import { resolvePublicProfilePicURL } from "@/lib/api";

// Lets the dashboard use a plain <img src="/api/images/profile/{userId}">
// without the browser calling the backend directly — this route resolves
// the URL server-side and redirects straight to Kosh.
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const url = await resolvePublicProfilePicURL(userId);
  if (!url) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.redirect(url);
}

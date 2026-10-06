import { NextResponse } from "next/server";
import { resolveAdminFileURL } from "@/lib/api";

// Same purpose as the profile-picture route, but for the admin-only file
// endpoint (parcel images, report attachments) — attaches the admin's
// bearer token server-side, since an <img> tag can't set an Authorization
// header itself.
export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const url = await resolveAdminFileURL(fileId);
  if (!url) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.redirect(url);
}

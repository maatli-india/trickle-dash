import { NextResponse } from "next/server";
import { postForFile } from "@/lib/api";

// Proxies the admin-selected payout ids to the backend's bulk-upload xlsx
// generator and streams the file straight back — the browser can't attach
// the admin's bearer token to a plain download link, so the client posts
// here (same-origin, cookie-authenticated) instead of to the backend
// directly. See postForFile's doc comment in lib/api.ts.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids : [];
  if (ids.length === 0) {
    return NextResponse.json({ message: "Select at least one payout to export." }, { status: 400 });
  }

  const result = await postForFile("/v1/admin/payouts/export", { ids });
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return new NextResponse(result.bytes, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
    },
  });
}

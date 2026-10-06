"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

// Used for anything resolved through the admin file-download proxy —
// parcel images, report attachments. Clicking opens the full-size image
// (the proxy's redirect target) in a new tab.
export function ImageThumb({ fileId, alt }: { fileId: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const src = `/api/images/file/${fileId}`;

  if (failed) {
    return (
      <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface-muted text-faint">
        <ImageOff size={16} />
        <span className="font-body text-[10px]">Unavailable</span>
      </div>
    );
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- same-origin proxy that 302s to Kosh, not a Next.js-optimizable static source */}
      <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />
    </a>
  );
}

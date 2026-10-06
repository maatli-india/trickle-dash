"use client";

import { useState } from "react";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]!.toUpperCase()).join("");
}

export function Avatar({ src, name, size = 48 }: { src: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-label text-sm text-muted"
        style={{ width: size, height: size }}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- same-origin proxy that 302s to Kosh, not a Next.js-optimizable static source
    <img
      src={src}
      alt={name ? `${name}'s profile photo` : "Profile photo"}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full border border-border object-cover"
      style={{ width: size, height: size }}
    />
  );
}

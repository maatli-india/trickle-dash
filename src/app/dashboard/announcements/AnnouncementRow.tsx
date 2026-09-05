"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDateTime } from "@/lib/format";
import { deleteAnnouncementAction } from "@/lib/actions/announcements";
import type { Announcement } from "@/lib/types";
import { AnnouncementForm } from "./AnnouncementForm";

const SEVERITY_TONE = { info: "info", warning: "accent", critical: "danger" } as const;

export function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={SEVERITY_TONE[announcement.severity]}>{announcement.severity}</Badge>
            {announcement.active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
          </div>
          <p className="mt-2 font-body text-sm text-ink">{announcement.message}</p>
          <p className="mt-1 font-body text-xs text-muted">
            {formatDateTime(announcement.startAt)}
            {announcement.endAt ? ` → ${formatDateTime(announcement.endAt)}` : " → no end date"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setEditing((v) => !v)} className="font-body text-xs text-muted hover:text-ink">
            {editing ? "Cancel" : "Edit"}
          </button>
          <form action={deleteAnnouncementAction.bind(null, announcement.id)}>
            <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-surface" aria-label="Delete">
              <Trash2 size={15} />
            </button>
          </form>
        </div>
      </div>
      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <AnnouncementForm announcement={announcement} />
        </div>
      ) : null}
    </div>
  );
}

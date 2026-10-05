"use client";

import { useActionState } from "react";
import { createAnnouncementAction, updateAnnouncementAction } from "@/lib/actions/announcements";
import { SubmitButton } from "@/components/SubmitButton";
import type { Announcement } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AnnouncementForm({ announcement }: { announcement?: Announcement }) {
  const action = announcement ? updateAnnouncementAction : createAnnouncementAction;
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {announcement ? <input type="hidden" name="id" value={announcement.id} /> : null}
      <div>
        <label className={LABEL}>Message</label>
        <textarea name="message" rows={3} defaultValue={announcement?.message} required className={FIELD} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Severity</label>
          <select name="severity" defaultValue={announcement?.severity ?? "info"} className={FIELD}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5">
          <input type="checkbox" name="active" defaultChecked={announcement?.active ?? true} className="h-4 w-4 accent-[var(--color-accent)]" />
          <span className="font-body text-sm text-ink">Active</span>
        </label>
        <div>
          <label className={LABEL}>Starts at</label>
          <input type="datetime-local" name="startAt" defaultValue={toLocalInput(announcement?.startAt) || toLocalInput(new Date().toISOString())} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Ends at (optional)</label>
          <input type="datetime-local" name="endAt" defaultValue={toLocalInput(announcement?.endAt)} className={FIELD} />
        </div>
      </div>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved.</p> : null}
      <SubmitButton>{announcement ? "Save changes" : "Create announcement"}</SubmitButton>
    </form>
  );
}

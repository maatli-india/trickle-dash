"use client";

import { useActionState, useState } from "react";
import { Bell } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { sendUserNotificationAction } from "@/lib/actions/users";

export function SendNotification({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(sendUserNotificationAction, undefined);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-muted" />
          <h2 className="font-display text-base font-semibold text-ink">Send push notification</h2>
        </div>
        <span className="font-body text-sm text-muted">{open ? "Collapse" : "Compose"}</span>
      </button>
      <p className="mt-1 font-body text-xs text-muted">Sends a one-off push (and tray notification) to this user&apos;s devices.</p>

      {open ? (
        <form
          key={state?.success ? "sent" : "compose"}
          action={formAction}
          className="mt-5 space-y-4 border-t border-border pt-5"
        >
          <input type="hidden" name="userId" value={userId} />
          <div>
            <label className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">Title</label>
            <input
              name="title"
              required
              maxLength={100}
              placeholder="Title shown on the notification"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">Body</label>
            <textarea
              name="body"
              rows={3}
              required
              maxLength={500}
              placeholder="Message body"
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
          {state?.success ? <p className="font-body text-sm text-success">Notification sent.</p> : null}
          <SubmitButton>Send notification</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}

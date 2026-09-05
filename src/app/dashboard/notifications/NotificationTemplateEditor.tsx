"use client";

import { useActionState, useState } from "react";
import { updateNotificationTemplateAction } from "@/lib/actions/notificationTemplates";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge } from "@/components/Badge";
import type { NotificationTemplateCatalogEntry } from "@/lib/types";

export function NotificationTemplateEditor({ entry }: { entry: NotificationTemplateCatalogEntry }) {
  const [state, formAction] = useActionState(updateNotificationTemplateAction, undefined);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-start justify-between gap-4 text-left">
        <div>
          <div className="flex items-center gap-2">
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-body text-xs text-muted">{entry.type}</code>
            {entry.isCustomized ? <Badge tone="accent">Customized</Badge> : <Badge tone="neutral">Default</Badge>}
          </div>
          <p className="mt-1.5 font-body text-xs text-muted">{entry.description}</p>
          <p className="mt-2 font-body text-sm font-medium text-ink">{entry.title}</p>
          <p className="mt-0.5 font-body text-sm text-muted">{entry.body}</p>
        </div>
        <span className="shrink-0 font-body text-sm text-muted">{expanded ? "Collapse" : "Edit"}</span>
      </button>

      {expanded ? (
        <form action={formAction} className="mt-5 space-y-4 border-t border-border pt-5">
          <input type="hidden" name="type" value={entry.type} />
          <div>
            <label className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">Title</label>
            <input
              name="title"
              defaultValue={entry.title}
              required
              maxLength={100}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">Body</label>
            <textarea
              name="body"
              rows={3}
              defaultValue={entry.body}
              required
              maxLength={500}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
          {state?.success ? <p className="font-body text-sm text-success">Saved — every future send of this notification uses this text.</p> : null}
          <SubmitButton>Save template</SubmitButton>
        </form>
      ) : null}
    </section>
  );
}

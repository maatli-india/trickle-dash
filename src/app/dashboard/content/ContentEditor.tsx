"use client";

import { useActionState, useState } from "react";
import { updateContentAction } from "@/lib/actions/content";
import { SubmitButton } from "@/components/SubmitButton";
import { formatDateTime } from "@/lib/format";
import type { AppContent } from "@/lib/types";

const KEY_LABELS: Record<string, string> = {
  privacy_policy: "Privacy Policy",
  terms_of_service: "Terms of Service",
  faq: "FAQ",
  parcel_declaration_liability: "Parcel declaration liability text",
};

export function ContentEditor({ content }: { content: AppContent }) {
  const [state, formAction] = useActionState(updateContentAction, undefined);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{KEY_LABELS[content.key] || content.key}</h2>
          <p className="mt-1 font-body text-xs text-muted">
            Version {content.version} · {content.format} · updated {formatDateTime(content.updatedAt)}
          </p>
        </div>
        <span className="font-body text-sm text-muted">{expanded ? "Collapse" : "Edit"}</span>
      </button>

      {expanded ? (
        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="key" value={content.key} />
          <div>
            <label className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">Title</label>
            <input
              name="title"
              defaultValue={content.title}
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">Format</label>
            <select name="format" defaultValue={content.format} className="rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent">
              <option value="markdown">Markdown</option>
              <option value="plaintext">Plain text</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted">Body</label>
            <textarea
              name="body"
              rows={12}
              defaultValue={content.body}
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
          {state?.success ? <p className="font-body text-sm text-success">Saved — live on the public endpoint immediately.</p> : null}
          <SubmitButton>Save {KEY_LABELS[content.key] || content.key}</SubmitButton>
        </form>
      ) : (
        <p className="mt-4 line-clamp-2 font-body text-sm text-muted">{content.body}</p>
      )}
    </section>
  );
}

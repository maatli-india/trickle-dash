"use client";

import { useActionState } from "react";
import { createKnowledgeBaseEntryAction, updateKnowledgeBaseEntryAction } from "@/lib/actions/knowledgeBase";
import { SubmitButton } from "@/components/SubmitButton";
import type { KnowledgeBaseEntry } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

export function KnowledgeBaseForm({
  entry,
  defaultQuestion,
  defaultAnswer,
  defaultSourceThreadId,
}: {
  entry?: KnowledgeBaseEntry;
  defaultQuestion?: string;
  defaultAnswer?: string;
  defaultSourceThreadId?: string;
}) {
  const action = entry ? updateKnowledgeBaseEntryAction : createKnowledgeBaseEntryAction;
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
      {!entry && defaultSourceThreadId ? <input type="hidden" name="sourceThreadId" value={defaultSourceThreadId} /> : null}
      <div>
        <label className={LABEL}>Question</label>
        <input
          type="text"
          name="question"
          defaultValue={entry?.question ?? defaultQuestion}
          required
          className={FIELD}
        />
      </div>
      <div>
        <label className={LABEL}>Answer</label>
        <textarea
          name="answer"
          rows={4}
          defaultValue={entry?.answer ?? defaultAnswer}
          required
          className={FIELD}
        />
      </div>
      <div>
        <label className={LABEL}>Keywords</label>
        <input
          type="text"
          name="keywords"
          defaultValue={entry?.keywords?.join(", ")}
          placeholder="e.g. refund, money back, रिफ़ंड"
          className={FIELD}
        />
        <p className="mt-1 font-body text-xs text-muted">
          Comma-separated words or phrases. If any appears in a user&apos;s message, the bot answers with this entry.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Category</label>
          <input type="text" name="category" defaultValue={entry?.category} placeholder="e.g. pricing" className={FIELD} />
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5">
          <input type="checkbox" name="active" defaultChecked={entry?.active ?? false} className="h-4 w-4 accent-[var(--color-accent)]" />
          <span className="font-body text-sm text-ink">Active (the support bot can answer with this)</span>
        </label>
      </div>
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved.</p> : null}
      <SubmitButton>{entry ? "Save changes" : "Create entry"}</SubmitButton>
    </form>
  );
}

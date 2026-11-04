"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { UserSearchChipInput } from "@/components/UserSearchChipInput";
import { createSegmentAction, deleteSegmentAction, previewSegmentAction } from "@/lib/actions/campaigns";
import type { Segment, SegmentPreviewResult, SegmentType } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

function SegmentCreateForm() {
  const [type, setType] = useState<SegmentType>("rule");
  const [state, formAction] = useActionState(createSegmentAction, undefined);

  return (
    <form key={state?.success ? "created" : "composing"} action={formAction} className="space-y-4">
      <div>
        <label className={LABEL}>Segment name</label>
        <input name="name" required maxLength={120} placeholder="e.g. Signed up this month" className={FIELD} />
      </div>

      <div>
        <label className={LABEL}>Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="radio"
              name="type"
              value="rule"
              checked={type === "rule"}
              onChange={() => setType("rule")}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Rule-based
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="radio"
              name="type"
              value="manual"
              checked={type === "manual"}
              onChange={() => setType("manual")}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Manual list
          </label>
        </div>
      </div>

      {type === "rule" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Signed up after</label>
            <input type="date" name="createdAfter" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Signed up before</label>
            <input type="date" name="createdBefore" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Status</label>
            <select name="status" defaultValue="" className={FIELD}>
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Referred by code</label>
            <input name="referredByCode" placeholder="Optional" className={FIELD} />
          </div>
          <p className="col-span-full font-body text-xs text-muted">
            This segment is re-evaluated live every time it&apos;s previewed or sent — &quot;signed up this month&quot; always means
            as of right now, not a frozen snapshot.
          </p>
        </div>
      ) : (
        <div>
          <label className={LABEL}>Phone numbers or emails</label>
          <UserSearchChipInput name="manualEntries" placeholder="Start typing an email or phone number…" />
        </div>
      )}

      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Segment created.</p> : null}
      <SubmitButton>Create segment</SubmitButton>
    </form>
  );
}

function SegmentRow({ segment }: { segment: Segment }) {
  const [preview, setPreview] = useState<SegmentPreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const runPreview = async () => {
    setPreviewing(true);
    setPreviewError("");
    try {
      setPreview(await previewSegmentAction(segment.id));
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Could not preview this segment.");
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-body text-sm font-medium text-ink">{segment.name}</p>
          <p className="mt-0.5 font-body text-xs text-muted">
            {segment.type === "rule" ? "Rule-based" : `Manual list · ${segment.manualEntries?.length ?? 0} entries`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={runPreview}
            disabled={previewing}
            className="rounded-lg border border-border px-3 py-1.5 font-body text-xs text-ink hover:bg-surface-muted disabled:opacity-60"
          >
            {previewing ? "Checking..." : "Preview"}
          </button>
          <form action={deleteSegmentAction.bind(null, segment.id)}>
            <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-surface" aria-label="Delete">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>
      {previewError ? <p className="mt-2 font-body text-xs text-danger">{previewError}</p> : null}
      {preview ? (
        <div className="mt-2 font-body text-xs text-muted">
          <p>~{preview.matchedCount} users will be reached.</p>
          {preview.unresolvedEntries && preview.unresolvedEntries.length > 0 ? (
            <p className="mt-1 text-danger">Could not resolve: {preview.unresolvedEntries.join(", ")}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SegmentManager({ segments }: { segments: Segment[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink">Segments</h2>
      <p className="mb-4 font-body text-sm text-muted">
        A reusable, nameable audience — a rule like &quot;signed up this month&quot;, or a manually curated list of specific people.
      </p>
      <SegmentCreateForm />
      <div className="mt-6 space-y-3 border-t border-border pt-5">
        {segments.length === 0 ? (
          <p className="font-body text-sm text-muted">No segments yet.</p>
        ) : (
          segments.map((segment) => <SegmentRow key={segment.id} segment={segment} />)
        )}
      </div>
    </section>
  );
}

"use client";

import { useActionState } from "react";
import { updateReportAction } from "@/lib/actions/reports";
import { SubmitButton } from "@/components/SubmitButton";
import type { Report } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

export function ReportActionForm({ report }: { report: Report }) {
  const [state, formAction] = useActionState(updateReportAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={report.id} />
      <div>
        <label className={LABEL}>Status</label>
        <select name="status" defaultValue={report.status} className={FIELD}>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="resolved">Resolved</option>
          <option value="closed_no_action">Closed, no action</option>
        </select>
      </div>
      <div>
        <label className={LABEL}>Resolution (if resolving)</label>
        <select name="resolution" defaultValue={report.resolution || ""} className={FIELD}>
          <option value="">—</option>
          <option value="action_taken">Action taken</option>
          <option value="no_violation_found">No violation found</option>
          <option value="insufficient_evidence">Insufficient evidence</option>
        </select>
      </div>
      <div>
        <label className={LABEL}>Message to reporter (optional)</label>
        <textarea name="reporterMessage" rows={2} className={FIELD} />
      </div>
      <div>
        <label className={LABEL}>Internal note (optional, not shown to reporter)</label>
        <textarea name="internalNote" rows={2} className={FIELD} />
      </div>
      {report.reportedType === "user" ? (
        <label className="flex items-center gap-2">
          <input type="checkbox" name="suspendReportedUser" className="h-4 w-4 accent-[var(--color-accent)]" />
          <span className="font-body text-sm text-ink">Suspend the reported account (blocks it and revokes active sessions immediately)</span>
        </label>
      ) : null}
      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved.</p> : null}
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}

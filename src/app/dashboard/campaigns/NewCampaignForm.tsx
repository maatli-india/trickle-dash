"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { createCampaignAction, previewSegmentAction } from "@/lib/actions/campaigns";
import type { Segment, SegmentPreviewResult } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

export function NewCampaignForm({ segments }: { segments: Segment[] }) {
  const [open, setOpen] = useState(false);
  const [segmentId, setSegmentId] = useState("");
  const [preview, setPreview] = useState<SegmentPreviewResult | null>(null);
  const [previewedFor, setPreviewedFor] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [state, formAction] = useActionState(createCampaignAction, undefined);

  const runPreview = async () => {
    if (!segmentId) return;
    setPreviewing(true);
    setPreviewError("");
    try {
      setPreview(await previewSegmentAction(segmentId));
      setPreviewedFor(segmentId);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Could not preview this segment.");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSegmentChange = (value: string) => {
    setSegmentId(value);
    setPreview(null);
    setPreviewedFor("");
  };

  const canSubmit = segmentId !== "" && previewedFor === segmentId;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-2">
          <Send size={16} className="text-muted" />
          <h2 className="font-display text-lg font-semibold text-ink">New campaign</h2>
        </div>
        <span className="font-body text-sm text-muted">{open ? "Collapse" : "Compose"}</span>
      </button>
      <p className="mt-1 font-body text-xs text-muted">
        Creates a draft — review the audience preview below, then use the Send button on the campaign row to actually dispatch it.
      </p>

      {open ? (
        <form
          key={state?.success ? "created" : "composing"}
          action={formAction}
          onSubmit={(e) => {
            if (!canSubmit) e.preventDefault();
          }}
          className="mt-5 space-y-4 border-t border-border pt-5"
        >
          <div>
            <label className={LABEL}>Campaign name</label>
            <input name="name" required maxLength={120} placeholder="Internal name, e.g. March re-engagement" className={FIELD} />
          </div>

          <div>
            <label className={LABEL}>Segment</label>
            <select
              name="segmentId"
              required
              value={segmentId}
              onChange={(e) => handleSegmentChange(e.target.value)}
              className={FIELD}
            >
              <option value="">Choose a segment</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL}>Title</label>
            <input name="title" required maxLength={120} placeholder="Title shown on the notification" className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Body</label>
            <textarea name="body" rows={3} required maxLength={500} placeholder="Message body" className={FIELD} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Deeplink (optional)</label>
              <input name="deeplink" maxLength={500} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Target (optional)</label>
              <input name="target" maxLength={120} className={FIELD} />
            </div>
          </div>
          <label className="flex items-start gap-2">
            <input type="checkbox" name="ignorePushPreference" className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]" />
            <span className="font-body text-sm text-ink">
              Send even to users who&apos;ve opted out of push — use only for a hand-picked, truly important segment.
            </span>
          </label>

          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-body text-sm text-ink">Preview audience before you can create this campaign.</p>
              <button
                type="button"
                onClick={runPreview}
                disabled={!segmentId || previewing}
                className="shrink-0 rounded-lg border border-border bg-surface px-3 py-1.5 font-body text-xs text-ink hover:bg-surface-muted disabled:opacity-60"
              >
                {previewing ? "Checking..." : "Preview audience"}
              </button>
            </div>
            {previewError ? <p className="mt-2 font-body text-xs text-danger">{previewError}</p> : null}
            {preview && previewedFor === segmentId ? (
              <div className="mt-2 font-body text-xs text-muted">
                <p>~{preview.matchedCount} users will be reached.</p>
                {preview.unresolvedEntries && preview.unresolvedEntries.length > 0 ? (
                  <p className="mt-1 text-danger">Could not resolve: {preview.unresolvedEntries.join(", ")}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
          {state?.success ? <p className="font-body text-sm text-success">Campaign created as a draft — find it below to send it.</p> : null}
          <SubmitButton className={!canSubmit ? "pointer-events-none opacity-60" : ""}>Create campaign (draft)</SubmitButton>
          {!canSubmit ? <p className="font-body text-xs text-muted">Run &quot;Preview audience&quot; for the selected segment first.</p> : null}
        </form>
      ) : null}
    </section>
  );
}

"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateParcelPricingTiersAction } from "@/lib/actions/config";
import { SubmitButton } from "@/components/SubmitButton";
import type { ParcelPricingTier } from "@/lib/types";

const FIELD = "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 font-body text-sm text-ink outline-none focus:border-accent";
const LABEL = "mb-1.5 block font-label text-xs font-semibold uppercase tracking-wide text-muted";

type Row = { minAmount: string; maxAmount: string; markupAmount: string };

function toRows(tiers: ParcelPricingTier[]): Row[] {
  if (tiers.length === 0) {
    return [{ minAmount: "0", maxAmount: "1000", markupAmount: "200" }];
  }
  return tiers.map((tier) => ({
    minAmount: String(tier.minAmount),
    maxAmount: tier.maxAmount === null || tier.maxAmount === undefined ? "" : String(tier.maxAmount),
    markupAmount: String(tier.markupAmount),
  }));
}

// lookupMarkup mirrors the backend's lookupPricingTierMarkup (travel.go): a
// flat markup per bracket, clamped to the nearest bracket outside the
// configured ladder — kept in sync so the preview matches what senders see.
function lookupMarkup(amount: number, rows: Row[]): number | null {
  const parsed = rows
    .map((row) => ({
      min: Number(row.minAmount) || 0,
      max: row.maxAmount.trim() === "" ? null : Number(row.maxAmount),
      markup: Number(row.markupAmount) || 0,
    }))
    .filter((tier) => Number.isFinite(tier.min) && Number.isFinite(tier.markup));
  if (parsed.length === 0) return null;
  for (const tier of parsed) {
    if (amount >= tier.min && (tier.max === null || amount <= tier.max)) {
      return tier.markup;
    }
  }
  const lowest = parsed.reduce((a, b) => (b.min < a.min ? b : a));
  if (amount < lowest.min) return lowest.markup;
  const highest = parsed.reduce((a, b) => (b.max === null ? b : a.max === null ? a : b.max > a.max ? b : a));
  return highest.markup;
}

export function ParcelPricingTiersForm({ tiers }: { tiers: ParcelPricingTier[] }) {
  const [state, formAction] = useActionState(updateParcelPricingTiersAction, undefined);
  const [rows, setRows] = useState<Row[]>(() => toRows(tiers));
  const [previewAmount, setPreviewAmount] = useState("500");

  const tiersJson = useMemo(
    () =>
      JSON.stringify(
        rows.map((row) => ({
          minAmount: Number(row.minAmount) || 0,
          maxAmount: row.maxAmount.trim() === "" ? null : Number(row.maxAmount),
          markupAmount: Number(row.markupAmount) || 0,
        })),
      ),
    [rows],
  );

  const previewMarkup = lookupMarkup(Number(previewAmount) || 0, rows);
  const previewTotal = previewMarkup === null ? null : (Number(previewAmount) || 0) + previewMarkup;

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const addRow = () => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      const nextMin = last?.maxAmount ? String(Number(last.maxAmount) + 1) : "0";
      return [...prev, { minAmount: nextMin, maxAmount: "", markupAmount: "" }];
    });
  };
  const removeRow = (index: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tiersJson" value={tiersJson} />

      <div className="space-y-2">
        <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-3 sm:grid">
          <span className={LABEL}>Traveller sets (min ₹)</span>
          <span className={LABEL}>Up to (max ₹, blank = no limit)</span>
          <span className={LABEL}>Sender pays extra (₹)</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
            <div>
              <label className={`${LABEL} sm:hidden`}>Min (₹)</label>
              <input
                type="number"
                min={0}
                step="1"
                value={row.minAmount}
                onChange={(e) => updateRow(index, { minAmount: e.target.value })}
                className={FIELD}
              />
            </div>
            <div>
              <label className={`${LABEL} sm:hidden`}>Max (₹, blank = no limit)</label>
              <input
                type="number"
                min={0}
                step="1"
                placeholder="No limit"
                value={row.maxAmount}
                onChange={(e) => updateRow(index, { maxAmount: e.target.value })}
                className={FIELD}
              />
            </div>
            <div>
              <label className={`${LABEL} sm:hidden`}>Sender pays extra (₹)</label>
              <input
                type="number"
                min={0}
                step="1"
                value={row.markupAmount}
                onChange={(e) => updateRow(index, { markupAmount: e.target.value })}
                className={FIELD}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Remove tier"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 font-body text-sm text-muted transition-colors hover:border-accent hover:text-ink"
      >
        <Plus size={15} /> Add tier
      </button>

      <div className="rounded-lg border border-border bg-surface-muted p-4">
        <label htmlFor="previewAmount" className={LABEL}>Preview: if traveller sets (₹)</label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="previewAmount"
            type="number"
            min={0}
            step="1"
            value={previewAmount}
            onChange={(e) => setPreviewAmount(e.target.value)}
            className={`${FIELD} max-w-[160px]`}
          />
          <p className="font-body text-sm text-ink">
            {previewTotal === null ? "Add a tier to preview." : (
              <>sender sees <span className="font-semibold">₹{previewTotal}</span> (+₹{previewMarkup})</>
            )}
          </p>
        </div>
      </div>

      {state?.error ? <p className="font-body text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="font-body text-sm text-success">Saved — takes effect immediately.</p> : null}
      <SubmitButton>Save pricing tiers</SubmitButton>
    </form>
  );
}

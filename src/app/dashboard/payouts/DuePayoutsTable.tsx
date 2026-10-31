"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { formatMoney } from "@/lib/format";
import type { Payout } from "@/lib/types";

export function DuePayoutsTable({ payouts }: { payouts: Payout[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const exportable = useMemo(() => payouts.filter((p) => p.bankReady), [payouts]);
  const allExportableSelected = exportable.length > 0 && exportable.every((p) => selected.has(p.id));

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allExportableSelected ? new Set() : new Set(exportable.map((p) => p.id)));
  };

  const download = async () => {
    setError("");
    setDownloading(true);
    try {
      const res = await fetch("/api/payouts/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Export failed (${res.status})`);
      }
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = match?.[1] || "trickle-payouts.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      // A full page reload (not router.refresh) so the exported rows drop
      // out of the Due tab on the next server fetch, same as any other
      // dashboard mutation followed by a revalidatePath elsewhere.
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export the selected payouts.");
    } finally {
      setDownloading(false);
    }
  };

  if (payouts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-4 py-8 text-center font-body text-sm text-muted">
        No payouts due right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm text-muted">
          {selected.size} of {exportable.length} exportable selected
          {exportable.length < payouts.length ? ` · ${payouts.length - exportable.length} missing bank details` : ""}
        </span>
        <button
          type="button"
          onClick={download}
          disabled={selected.size === 0 || downloading}
          className="rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink hover:brightness-95 disabled:opacity-60"
        >
          {downloading ? "Preparing file..." : "Download payout file"}
        </button>
      </div>
      {error ? <p className="font-body text-sm text-danger">{error}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">
                <input type="checkbox" checked={allExportableSelected} onChange={toggleAll} className="h-4 w-4 accent-[var(--color-accent)]" />
              </th>
              <th className="px-4 py-3 font-medium">Traveler</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Bank account</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(payout.id)}
                    disabled={!payout.bankReady}
                    onChange={() => toggle(payout.id)}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                </td>
                <td className="px-4 py-3 font-body text-sm text-ink">{payout.travelerName || payout.travelerUserId}</td>
                <td className="px-4 py-3 font-body text-xs text-muted">{payout.route || "—"}</td>
                <td className="px-4 py-3 font-body text-sm text-ink">{formatMoney(Math.round(payout.amount * 100), "INR")}</td>
                <td className="px-4 py-3">
                  {payout.bankReady ? <Badge tone="success">Ready</Badge> : <Badge tone="danger">Missing details</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

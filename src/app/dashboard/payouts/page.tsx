import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Paged, Payout } from "@/lib/types";
import { Pagination } from "@/components/Pagination";
import { StatCard } from "@/components/StatCard";
import { formatDateTime, formatMoney } from "@/lib/format";
import { AlertTriangle, Clock, Wallet, XCircle } from "lucide-react";
import { DuePayoutsTable } from "./DuePayoutsTable";
import { PayoutActionRow } from "./PayoutActionRow";

export const metadata = { title: "Payouts — Trickle Dash" };

const TABS = [
  { key: "due", label: "Due" },
  { key: "exported", label: "Exported" },
  { key: "paid", label: "Paid" },
  { key: "failed", label: "Failed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

async function count(path: string): Promise<number> {
  try {
    const paged = await apiGet<Paged<unknown>>(path);
    return paged.total;
  } catch {
    return 0;
  }
}

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === params.tab) ? (params.tab as TabKey) : "due";
  const page = Number(params.page) || 1;

  const listPath =
    tab === "due" ? `/v1/admin/payouts/due?page=${page}&limit=20` : `/v1/admin/payouts?status=${tab}&page=${page}&limit=20`;

  const [paged, dueCount, exportedCount, failedCount] = await Promise.all([
    apiGet<Paged<Payout>>(listPath),
    count("/v1/admin/payouts/due?limit=1"),
    count("/v1/admin/payouts?status=exported&limit=1"),
    count("/v1/admin/payouts?status=failed&limit=1"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Payouts</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Traveller earnings owed for completed deliveries — export the weekly RBL bulk-upload file here, then confirm each transfer
          once it&rsquo;s done.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Due this cycle" value={dueCount} icon={Wallet} tone={dueCount > 0 ? "accent" : "neutral"} />
        <StatCard label="Exported, awaiting confirmation" value={exportedCount} icon={Clock} tone={exportedCount > 0 ? "accent" : "neutral"} />
        <StatCard label="Failed transfers" value={failedCount} icon={AlertTriangle} tone={failedCount > 0 ? "danger" : "neutral"} />
      </div>

      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/payouts?tab=${t.key}`}
            className={`px-3.5 py-2 font-body text-sm font-medium ${
              tab === t.key ? "border-b-2 border-accent text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "due" ? (
        <DuePayoutsTable payouts={paged.items} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Traveler</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                {tab === "exported" ? <th className="px-4 py-3 font-medium">Exported</th> : null}
                {tab === "paid" ? <th className="px-4 py-3 font-medium">Paid</th> : null}
                {tab === "paid" ? <th className="px-4 py-3 font-medium">UTR</th> : null}
                {tab === "failed" ? <th className="px-4 py-3 font-medium">Reason</th> : null}
                {tab === "exported" ? <th className="px-4 py-3 font-medium">Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {paged.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-muted">
                    {tab === "failed" ? (
                      <>No failed transfers — a payout marked failed here goes back to the Due tab automatically.</>
                    ) : (
                      <>Nothing here yet.</>
                    )}
                  </td>
                </tr>
              ) : (
                paged.items.map((payout) => (
                  <tr key={payout.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-4 py-3 font-body text-sm text-ink">{payout.travelerName || payout.travelerUserId}</td>
                    <td className="px-4 py-3 font-body text-xs text-muted">{payout.route || "—"}</td>
                    <td className="px-4 py-3 font-body text-sm text-ink">{formatMoney(Math.round(payout.amount * 100), "INR")}</td>
                    {tab === "exported" ? (
                      <td className="px-4 py-3 font-body text-xs text-muted">{payout.exportedAt ? formatDateTime(payout.exportedAt) : "—"}</td>
                    ) : null}
                    {tab === "paid" ? (
                      <td className="px-4 py-3 font-body text-xs text-muted">{payout.paidAt ? formatDateTime(payout.paidAt) : "—"}</td>
                    ) : null}
                    {tab === "paid" ? <td className="px-4 py-3 font-body text-xs text-muted">{payout.utr || "—"}</td> : null}
                    {tab === "failed" ? (
                      <td className="px-4 py-3 font-body text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <XCircle size={12} className="text-danger" />
                          {payout.failureReason || "—"}
                        </span>
                      </td>
                    ) : null}
                    {tab === "exported" ? (
                      <td className="px-4 py-3">
                        <PayoutActionRow payoutId={payout.id} />
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} limit={20} total={paged.total} basePath="/dashboard/payouts" searchParams={{ tab }} />
    </div>
  );
}

import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Paged, Transaction } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Pagination } from "@/components/Pagination";
import { StatCard } from "@/components/StatCard";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Wallet, RefreshCcw, AlertTriangle } from "lucide-react";

export const metadata = { title: "Payments — Trickle Dash" };

const STATUS_TONE: Record<string, "success" | "danger" | "accent" | "neutral" | "info"> = {
  escrowed: "success",
  refund_completed: "success",
  failed: "danger",
  refund_failed: "danger",
  checkout_open: "accent",
  refund_pending: "accent",
  refund_processing: "accent",
  superseded: "neutral",
};

const STATUS_OPTIONS = [
  "checkout_open",
  "escrowed",
  "failed",
  "superseded",
  "refund_pending",
  "refund_processing",
  "refund_completed",
  "refund_failed",
];

async function count(path: string): Promise<number> {
  try {
    const paged = await apiGet<Paged<unknown>>(path);
    return paged.total;
  } catch {
    return 0;
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; entityId?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.status) query.set("status", params.status);
  if (params.entityId) query.set("entityId", params.entityId);
  query.set("page", String(page));
  query.set("limit", "20");

  const [paged, escrowed, refundProcessing, refundFailed] = await Promise.all([
    apiGet<Paged<Transaction>>(`/v1/admin/transactions?${query.toString()}`),
    count("/v1/admin/transactions?status=escrowed&limit=1"),
    count("/v1/admin/transactions?status=refund_processing&limit=1"),
    count("/v1/admin/transactions?status=refund_failed&limit=1"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Payments</h1>
        <p className="mt-1 font-body text-sm text-muted">Every payment and refund attempt recorded on the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Currently escrowed" value={escrowed} icon={Wallet} />
        <StatCard label="Refunds in progress" value={refundProcessing} icon={RefreshCcw} tone={refundProcessing > 0 ? "accent" : "neutral"} />
        <StatCard label="Refunds failed" value={refundFailed} icon={AlertTriangle} tone={refundFailed > 0 ? "danger" : "neutral"} />
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="type" defaultValue={params.type || ""} className="rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent">
          <option value="">Any type</option>
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
        </select>
        <select name="status" defaultValue={params.status || ""} className="rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent">
          <option value="">Any status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="entityId"
          defaultValue={params.entityId || ""}
          placeholder="Request ID"
          className="rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink hover:brightness-95">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Request</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Gateway</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-muted">
                  No transactions match this filter.
                </td>
              </tr>
            ) : (
              paged.items.map((txn) => (
                <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/payments/${txn.id}`} className="font-body text-sm font-medium capitalize text-ink hover:underline">
                      {txn.type}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-ink">{formatMoney(txn.amountMinor, txn.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[txn.status] || "neutral"}>{txn.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted">
                    {txn.entityType === "parcel-match" ? (
                      <Link href={`/dashboard/requests/${txn.entityId}`} className="hover:underline">
                        {txn.entityId}
                      </Link>
                    ) : (
                      txn.entityId
                    )}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{txn.userId}</td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{txn.gateway}</td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{formatDateTime(txn.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} limit={20} total={paged.total} basePath="/dashboard/payments" searchParams={params} />
    </div>
  );
}

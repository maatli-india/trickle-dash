import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Paged, SupportThread } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Pagination } from "@/components/Pagination";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "Support chats — Trickle Dash" };

const STATUS_TONE = { open: "danger", resolved: "success", closed: "neutral" } as const;

export default async function SupportChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page", String(page));
  query.set("limit", "20");

  const paged = await apiGet<Paged<SupportThread>>(`/v1/admin/support-chats?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Support chats</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Live chats opened from the mobile app&apos;s &quot;chat with support&quot; feature.
        </p>
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="status" defaultValue={params.status || ""} className="rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent">
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink hover:brightness-95">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last message</th>
              <th className="px-4 py-3 font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-muted">
                  No support chats match this filter.
                </td>
              </tr>
            ) : (
              paged.items.map((thread) => (
                <tr key={thread.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/support-chats/${thread.id}`} className="font-body text-sm font-medium text-ink hover:underline">
                      {thread.userId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{thread.reasonLabel}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[thread.status]}>{thread.status}</Badge>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate font-body text-xs text-muted">{thread.lastMessagePreview || "—"}</td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{formatRelativeTime(thread.lastMessageAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} limit={20} total={paged.total} basePath="/dashboard/support-chats" searchParams={params} />
    </div>
  );
}

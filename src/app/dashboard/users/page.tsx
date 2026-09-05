import { apiGet } from "@/lib/api";
import type { Paged, AdminUser } from "@/lib/types";
import { Pagination } from "@/components/Pagination";
import { UserRow } from "./UserRow";

export const metadata = { title: "Users — Trickle Dash" };

const FIELD = "rounded-lg border border-border bg-surface px-3.5 py-2 font-body text-sm text-ink outline-none focus:border-accent";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  query.set("page", String(page));
  query.set("limit", "20");

  const paged = await apiGet<Paged<AdminUser>>(`/v1/admin/users?${query.toString()}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
        <p className="mt-1 font-body text-sm text-muted">Search, review, and ban or unban accounts.</p>
      </div>

      <form className="flex flex-wrap gap-3">
        <input type="text" name="search" placeholder="Search name, phone, or email" defaultValue={params.search} className={`${FIELD} min-w-64`} />
        <select name="status" defaultValue={params.status || ""} className={FIELD}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Deleted</option>
        </select>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-accent-ink hover:brightness-95">
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Identity</th>
              <th className="px-4 py-3 font-medium">Trips</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-muted">
                  No users match this search.
                </td>
              </tr>
            ) : (
              paged.items.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} limit={20} total={paged.total} basePath="/dashboard/users" searchParams={params} />
    </div>
  );
}

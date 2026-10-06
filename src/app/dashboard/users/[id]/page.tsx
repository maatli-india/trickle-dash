import Link from "next/link";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { AdminUser, Paged, ParcelMatch, TravelPlan, Report, UserReview, SavedPlace } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { BanControls } from "./BanControls";
import { SendNotification } from "./SendNotification";
import { UserDetailTabs } from "./UserDetailTabs";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata = { title: "User detail — Trickle Dash" };

async function safePaged<T>(path: string): Promise<T[]> {
  try {
    const paged = await apiGet<Paged<T>>(path);
    return paged.items;
  } catch {
    return [];
  }
}

async function safeList<T>(path: string): Promise<T[]> {
  try {
    return await apiGet<T[]>(path);
  } catch {
    return [];
  }
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [user, requests, trips, reportsFiled, reportsAgainst, reviewsPaged, savedPlaces, blockedUsers] = await Promise.all([
    // Note: basic user detail is GET /v1/users/{id} (the existing
    // user-facing route, now also admin-token-accepting) — not
    // /v1/admin/users/{id}, which doesn't exist. Every other call below is
    // a real /v1/admin/... endpoint.
    apiGet<AdminUser>(`/v1/users/${encodeURIComponent(id)}`),
    safePaged<ParcelMatch>(`/v1/admin/parcel-matches?userId=${encodeURIComponent(id)}&limit=50`),
    safePaged<TravelPlan>(`/v1/admin/travel-plans?travelerId=${encodeURIComponent(id)}&limit=50`),
    safePaged<Report>(`/v1/admin/reports?reporterId=${encodeURIComponent(id)}&limit=50`),
    safePaged<Report>(`/v1/admin/reports?reportedId=${encodeURIComponent(id)}&limit=50`),
    apiGet<Paged<UserReview>>(`/v1/admin/users/${encodeURIComponent(id)}/reviews?limit=50`).catch(() => ({ items: [] as UserReview[], total: 0, page: 1, limit: 50 })),
    safeList<SavedPlace>(`/v1/admin/users/${encodeURIComponent(id)}/saved-places`),
    safeList<AdminUser>(`/v1/admin/users/${encodeURIComponent(id)}/blocked`),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/dashboard/users" className="inline-flex items-center gap-1.5 font-body text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to users
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar src={`/api/images/profile/${user.id}`} name={user.name || "Unnamed user"} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-semibold text-ink">{user.name || "Unnamed user"}</h1>
                {user.verified ? <ShieldCheck size={16} className="text-success" /> : null}
              </div>
              <p className="mt-1 font-body text-sm text-muted">
                {user.phone} {user.email ? `· ${user.email}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={user.status === "active" ? "success" : user.status === "blocked" ? "danger" : "neutral"}>{user.status}</Badge>
                {user.verified ? <Badge tone="success">Identity verified</Badge> : <Badge tone="neutral">Not verified</Badge>}
                {user.underInvestigation ? <Badge tone="danger">Under investigation</Badge> : null}
              </div>
            </div>
          </div>
          <BanControls user={user} />
        </div>

        {user.banReason ? (
          <div className="mt-4 space-y-2">
            <div className="rounded-xl border border-danger-border bg-danger-surface p-3 font-body text-xs text-danger">
              Banned {user.bannedAt ? formatDateTime(user.bannedAt) : ""}: {user.banReason}
            </div>
            {user.status !== "blocked" && user.unbanReason ? (
              <div className="rounded-xl border border-border bg-surface-muted p-3 font-body text-xs text-muted">
                Unbanned {user.unbannedAt ? formatDateTime(user.unbannedAt) : ""}: {user.unbanReason}
              </div>
            ) : null}
          </div>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 font-body text-sm sm:grid-cols-4">
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Rating</dt>
            <dd className="mt-0.5 flex items-center gap-1 text-ink">
              <Star size={13} className="fill-current text-warning" />
              {user.ratings?.toFixed(1) ?? "—"} <span className="text-muted">({user.ratingCount})</span>
            </dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Completed trips</dt>
            <dd className="mt-0.5 text-ink">{user.completedTrips}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Requests</dt>
            <dd className="mt-0.5 text-ink">{requests.length}</dd>
          </div>
          <div>
            <dt className="font-label text-xs uppercase tracking-wide text-muted">Joined</dt>
            <dd className="mt-0.5 text-ink">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <SendNotification userId={user.id} />

      <div className="rounded-2xl border border-border bg-surface p-6">
        <UserDetailTabs
          requests={requests}
          trips={trips}
          reportsFiled={reportsFiled}
          reportsAgainst={reportsAgainst}
          reviews={reviewsPaged.items}
          savedPlaces={savedPlaces}
          blockedUsers={blockedUsers}
        />
      </div>
    </div>
  );
}

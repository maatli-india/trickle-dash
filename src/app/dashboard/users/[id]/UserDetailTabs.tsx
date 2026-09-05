"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MapPin, Ban } from "lucide-react";
import { Badge } from "@/components/Badge";
import type { AdminUser, ParcelMatch, TravelPlan, Report, UserReview, SavedPlace } from "@/lib/types";
import { formatDate } from "@/lib/format";

const TABS = ["requests", "trips", "reports", "reviews", "saved-places", "blocked"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  requests: "Requests",
  trips: "Trips",
  reports: "Reports",
  reviews: "Reviews",
  "saved-places": "Saved places",
  blocked: "Blocked users",
};

export function UserDetailTabs({
  requests,
  trips,
  reportsFiled,
  reportsAgainst,
  reviews,
  savedPlaces,
  blockedUsers,
}: {
  requests: ParcelMatch[];
  trips: TravelPlan[];
  reportsFiled: Report[];
  reportsAgainst: Report[];
  reviews: UserReview[];
  savedPlaces: SavedPlace[];
  blockedUsers: AdminUser[];
}) {
  const [tab, setTab] = useState<Tab>("requests");

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2.5 font-body text-sm transition-colors ${
              tab === t ? "border-b-2 border-accent text-ink font-medium" : "text-muted hover:text-ink"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {tab === "requests" && (
          <List
            items={requests}
            empty="No parcel requests."
            render={(m) => (
              <Row key={m.id} href={`/dashboard/requests/${m.id}`}>
                <div>
                  <p className="font-body text-sm text-ink">{m.parcelDescription || m.parcelCategory || "Parcel"}</p>
                  <p className="font-body text-xs text-muted">{formatDate(m.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {m.safetyHold ? <Badge tone="danger">On hold</Badge> : null}
                  <Badge tone="neutral">{m.status.replace(/_/g, " ")}</Badge>
                </div>
              </Row>
            )}
          />
        )}

        {tab === "trips" && (
          <List
            items={trips}
            empty="No trips posted."
            render={(t) => (
              <Row key={t.id} href={`/dashboard/trips/${t.id}`}>
                <div>
                  <p className="font-body text-sm text-ink">
                    {t.from?.address || "?"} → {t.to?.address || "?"}
                  </p>
                  <p className="font-body text-xs text-muted">{t.departureDate}</p>
                </div>
                <Badge tone={t.status === "active" ? "success" : "neutral"}>{t.status}</Badge>
              </Row>
            )}
          />
        )}

        {tab === "reports" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-muted">Filed by this user</h3>
              <List
                items={reportsFiled}
                empty="No reports filed by this user."
                render={(r) => (
                  <Row key={r.id} href={`/dashboard/reports/${r.id}`}>
                    <p className="font-body text-sm text-ink">{r.category.replace(/_/g, " ")}</p>
                    <Badge tone={r.urgent ? "danger" : "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
                  </Row>
                )}
              />
            </div>
            <div>
              <h3 className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-muted">Filed against this user</h3>
              <List
                items={reportsAgainst}
                empty="No reports filed against this user."
                render={(r) => (
                  <Row key={r.id} href={`/dashboard/reports/${r.id}`}>
                    <p className="font-body text-sm text-ink">{r.category.replace(/_/g, " ")}</p>
                    <Badge tone={r.urgent ? "danger" : "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
                  </Row>
                )}
              />
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <List
            items={reviews}
            empty="No reviews yet."
            render={(r) => (
              <div key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                <div>
                  <p className="font-body text-sm text-ink">{r.review || <span className="text-muted">No written review.</span>}</p>
                  <p className="mt-1 font-body text-xs text-muted">
                    {r.reviewerName} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 font-body text-sm text-ink">
                  <Star size={13} className="fill-current text-warning" />
                  {r.rating}
                </div>
              </div>
            )}
          />
        )}

        {tab === "saved-places" && (
          <List
            items={savedPlaces}
            empty="No saved addresses."
            render={(p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-4">
                <MapPin size={15} className="text-muted" />
                <div>
                  <p className="font-body text-sm text-ink">{p.label}</p>
                  <p className="font-body text-xs text-muted">{p.place?.address || "—"}</p>
                </div>
              </div>
            )}
          />
        )}

        {tab === "blocked" && (
          <List
            items={blockedUsers}
            empty="This user hasn't blocked anyone."
            render={(u) => (
              <Row key={u.id} href={`/dashboard/users/${u.id}`}>
                <div className="flex items-center gap-2">
                  <Ban size={13} className="text-danger" />
                  <p className="font-body text-sm text-ink">{u.name || u.phone}</p>
                </div>
              </Row>
            )}
          />
        )}
      </div>
    </div>
  );
}

function List<T>({ items, empty, render }: { items: T[]; empty: string; render: (item: T) => React.ReactNode }) {
  if (items.length === 0) return <p className="font-body text-sm text-muted">{empty}</p>;
  return <div className="space-y-2">{items.map(render)}</div>;
}

function Row({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-surface-muted">
      {children}
    </Link>
  );
}

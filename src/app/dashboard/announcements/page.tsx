import { apiGet } from "@/lib/api";
import type { Paged, Announcement } from "@/lib/types";
import { AnnouncementForm } from "./AnnouncementForm";
import { AnnouncementRow } from "./AnnouncementRow";

export const metadata = { title: "Announcements — Trickle Dash" };

export default async function AnnouncementsPage() {
  const paged = await apiGet<Paged<Announcement>>("/v1/admin/announcements?limit=50");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Announcements</h1>
        <p className="mt-1 font-body text-sm text-muted">
          In-app banners the mobile app can show without a release. Note: the app doesn&apos;t poll <code className="rounded bg-surface-muted px-1">
            GET /v1/announcements/active
          </code>{" "}
          yet — that client-side wiring is a follow-up.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">New announcement</h2>
        <AnnouncementForm />
      </section>

      <div className="space-y-4">
        {paged.items.length === 0 ? (
          <p className="font-body text-sm text-muted">No announcements yet.</p>
        ) : (
          paged.items.map((announcement) => <AnnouncementRow key={announcement.id} announcement={announcement} />)
        )}
      </div>
    </div>
  );
}

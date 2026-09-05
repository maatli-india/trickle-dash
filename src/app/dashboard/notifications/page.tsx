import { apiGet } from "@/lib/api";
import type { NotificationTemplateCatalogEntry } from "@/lib/types";
import { NotificationTemplateEditor } from "./NotificationTemplateEditor";

export const metadata = { title: "Notifications — Trickle Dash" };

export default async function NotificationTemplatesPage() {
  const entries = await apiGet<NotificationTemplateCatalogEntry[]>("/v1/admin/notification-templates");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Notification templates</h1>
        <p className="mt-1 font-body text-sm text-muted">
          The exact title and body sent for each push notification. Saving here changes what the app sends immediately — no release required.
        </p>
      </div>
      <div className="space-y-4">
        {entries.map((entry) => (
          <NotificationTemplateEditor key={entry.type} entry={entry} />
        ))}
      </div>
    </div>
  );
}

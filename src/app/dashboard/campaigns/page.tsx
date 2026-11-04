import { apiGet } from "@/lib/api";
import type { Campaign, Paged, Segment } from "@/lib/types";
import { Pagination } from "@/components/Pagination";
import { SegmentManager } from "./SegmentManager";
import { NewCampaignForm } from "./NewCampaignForm";
import { CampaignRow } from "./CampaignRow";

export const metadata = { title: "Campaigns — Trickle Dash" };

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 20;

  const [campaignsPaged, segmentsPaged] = await Promise.all([
    apiGet<Paged<Campaign>>(`/v1/admin/campaigns?page=${page}&limit=${limit}`),
    apiGet<Paged<Segment>>("/v1/admin/segments?limit=100"),
  ]);
  const segments = segmentsPaged.items;
  const segmentName = (segmentId: string) => segments.find((s) => s.id === segmentId)?.name ?? "(deleted segment)";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Campaigns</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Define a segment of registered users, then compose and send a push notification to re-engage them. Sends go out immediately
          and run in the background — a large send can take a few minutes.
        </p>
      </div>

      <SegmentManager segments={segments} />
      <NewCampaignForm segments={segments} />

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Past campaigns</h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border font-label text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Segment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Counts</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {campaignsPaged.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-muted">
                    No campaigns yet.
                  </td>
                </tr>
              ) : (
                campaignsPaged.items.map((campaign) => (
                  <CampaignRow key={campaign.id} campaign={campaign} segmentName={segmentName(campaign.segmentId)} />
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={limit} total={campaignsPaged.total} basePath="/dashboard/campaigns" searchParams={params} />
      </section>
    </div>
  );
}

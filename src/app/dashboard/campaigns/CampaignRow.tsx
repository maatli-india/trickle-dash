"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { formatDateTime } from "@/lib/format";
import { getCampaignAction, sendCampaignAction } from "@/lib/actions/campaigns";
import type { Campaign, CampaignStatus } from "@/lib/types";

const STATUS_TONE: Record<CampaignStatus, "neutral" | "info" | "success" | "danger"> = {
  draft: "neutral",
  sending: "info",
  completed: "success",
  failed: "danger",
};

function CountsLine({ campaign }: { campaign: Campaign }) {
  if (campaign.status === "draft") {
    return <span className="font-body text-xs text-muted">Not sent yet</span>;
  }
  return (
    <span className="font-body text-xs text-muted">
      {campaign.matchedCount} matched · {campaign.usersWithTokenCount} reachable · {campaign.sentCount} sent · {campaign.failedCount} failed
    </span>
  );
}

export function CampaignRow({ campaign, segmentName }: { campaign: Campaign; segmentName: string }) {
  const [live, setLive] = useState(campaign);

  useEffect(() => {
    if (live.status !== "sending") return;
    const interval = setInterval(async () => {
      try {
        setLive(await getCampaignAction(live.id));
      } catch {
        // transient — try again on the next tick
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [live.status, live.id]);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-body text-sm text-ink">{live.name}</td>
      <td className="px-4 py-3 font-body text-sm text-muted">{segmentName}</td>
      <td className="px-4 py-3">
        <Badge tone={STATUS_TONE[live.status]}>{live.status}</Badge>
      </td>
      <td className="px-4 py-3">
        <CountsLine campaign={live} />
      </td>
      <td className="px-4 py-3 font-body text-xs text-muted">{formatDateTime(live.createdAt)}</td>
      <td className="px-4 py-3 text-right">
        {live.status === "draft" ? (
          <form action={sendCampaignAction.bind(null, live.id)}>
            <button type="submit" className="rounded-lg bg-accent px-3 py-1.5 font-body text-xs font-medium text-accent-ink hover:brightness-95">
              Send now
            </button>
          </form>
        ) : null}
      </td>
    </tr>
  );
}

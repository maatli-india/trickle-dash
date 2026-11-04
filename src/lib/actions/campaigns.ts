"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiGet, apiPost } from "../api";
import type { Campaign, Segment, SegmentPreviewResult, SegmentRule, SegmentType } from "../types";
import type { ActionState } from "./config";

function toISODate(value: FormDataEntryValue | null): string | undefined {
  const str = String(value || "").trim();
  if (!str) return undefined;
  return new Date(str).toISOString();
}

function parseManualEntries(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string" && entry.trim() !== "");
  } catch {
    return [];
  }
}

export async function createSegmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "") as SegmentType;
  if (!name) return { error: "A segment name is required." };
  if (type !== "rule" && type !== "manual") return { error: "Choose a segment type." };

  let rule: SegmentRule | undefined;
  let manualEntries: string[] | undefined;

  if (type === "rule") {
    const createdAfter = toISODate(formData.get("createdAfter"));
    const createdBefore = toISODate(formData.get("createdBefore"));
    const status = String(formData.get("status") || "").trim();
    const referredByCode = String(formData.get("referredByCode") || "").trim();
    if (!createdAfter && !createdBefore && !status && !referredByCode) {
      return { error: "Set at least one rule filter." };
    }
    rule = {
      createdAfter,
      createdBefore,
      status: (status || undefined) as SegmentRule["status"],
      referredByCode: referredByCode || undefined,
    };
  } else {
    manualEntries = parseManualEntries(formData.get("manualEntries"));
    if (manualEntries.length === 0) return { error: "Add at least one phone number or email." };
  }

  try {
    await apiPost<Segment>("/v1/admin/segments", { name, type, rule, manualEntries });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create this segment." };
  }
  revalidatePath("/dashboard/campaigns");
  return { success: true };
}

export async function deleteSegmentAction(id: string) {
  await apiDelete(`/v1/admin/segments/${encodeURIComponent(id)}`);
  revalidatePath("/dashboard/campaigns");
}

export async function previewSegmentAction(segmentId: string): Promise<SegmentPreviewResult> {
  return apiGet<SegmentPreviewResult>(`/v1/admin/segments/${encodeURIComponent(segmentId)}/preview`);
}

export async function createCampaignAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const segmentId = String(formData.get("segmentId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const deeplink = String(formData.get("deeplink") || "").trim();
  const target = String(formData.get("target") || "").trim();
  const ignorePushPreference = formData.get("ignorePushPreference") === "on";

  if (!name || !segmentId || !title || !body) {
    return { error: "Name, segment, title, and body are required." };
  }

  try {
    await apiPost<Campaign>("/v1/admin/campaigns", {
      name,
      segmentId,
      title,
      body,
      deeplink: deeplink || undefined,
      target: target || undefined,
      ignorePushPreference,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create this campaign." };
  }
  revalidatePath("/dashboard/campaigns");
  return { success: true };
}

export async function sendCampaignAction(id: string) {
  await apiPost(`/v1/admin/campaigns/${encodeURIComponent(id)}/send`, {});
  revalidatePath("/dashboard/campaigns");
}

/** Polled directly from a client component (CampaignRow) while a campaign's status is "sending" — same direct-call-a-server-action pattern as previewSegmentAction. */
export async function getCampaignAction(id: string): Promise<Campaign> {
  return apiGet<Campaign>(`/v1/admin/campaigns/${encodeURIComponent(id)}`);
}

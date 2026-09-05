"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiPatch, apiPost } from "../api";
import type { Announcement } from "../types";
import type { ActionState } from "./config";

function toISODate(value: FormDataEntryValue | null): string | undefined {
  const str = String(value || "").trim();
  if (!str) return undefined;
  return new Date(str).toISOString();
}

export async function createAnnouncementAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const message = String(formData.get("message") || "").trim();
  if (!message) return { error: "Message is required." };
  try {
    await apiPost<Announcement>("/v1/admin/announcements", {
      message,
      severity: String(formData.get("severity") || "info"),
      active: formData.get("active") === "on",
      startAt: toISODate(formData.get("startAt")) || new Date().toISOString(),
      endAt: toISODate(formData.get("endAt")),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the announcement." };
  }
  revalidatePath("/dashboard/announcements");
  return { success: true };
}

export async function updateAnnouncementAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  const message = String(formData.get("message") || "").trim();
  if (!id || !message) return { error: "Message is required." };
  try {
    await apiPatch<Announcement>(`/v1/admin/announcements/${encodeURIComponent(id)}`, {
      message,
      severity: String(formData.get("severity") || "info"),
      active: formData.get("active") === "on",
      startAt: toISODate(formData.get("startAt")) || new Date().toISOString(),
      endAt: toISODate(formData.get("endAt")),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update the announcement." };
  }
  revalidatePath("/dashboard/announcements");
  return { success: true };
}

export async function deleteAnnouncementAction(id: string) {
  await apiDelete(`/v1/admin/announcements/${encodeURIComponent(id)}`);
  revalidatePath("/dashboard/announcements");
}

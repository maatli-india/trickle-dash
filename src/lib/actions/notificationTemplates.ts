"use server";

import { revalidatePath } from "next/cache";
import { apiPatch } from "../api";
import type { NotificationTemplateCatalogEntry } from "../types";
import type { ActionState } from "./config";

export async function updateNotificationTemplateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const type = String(formData.get("type") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!type || !title || !body) return { error: "Title and body are required." };
  try {
    await apiPatch<NotificationTemplateCatalogEntry>(`/v1/admin/notification-templates/${encodeURIComponent(type)}`, { title, body });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save this template." };
  }
  revalidatePath("/dashboard/notifications");
  return { success: true };
}

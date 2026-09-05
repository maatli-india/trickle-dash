"use server";

import { revalidatePath } from "next/cache";
import { apiPatch } from "../api";
import type { AppContent } from "../types";
import type { ActionState } from "./config";

export async function updateContentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const key = String(formData.get("key") || "");
  const title = String(formData.get("title") || "");
  const body = String(formData.get("body") || "");
  const format = String(formData.get("format") || "markdown");
  if (!key || !title.trim() || !body.trim()) {
    return { error: "Title and body are required." };
  }
  try {
    await apiPatch<AppContent>(`/v1/admin/content/${encodeURIComponent(key)}`, { title, body, format });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save this content." };
  }
  revalidatePath("/dashboard/content");
  return { success: true };
}

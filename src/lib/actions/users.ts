"use server";

import { revalidatePath } from "next/cache";
import { apiGet, apiPost } from "../api";
import type { ActionState } from "./config";
import type { UserSuggestion } from "../types";

/**
 * Typeahead for a Campaign manual segment — active users whose email or
 * phone starts with q. Called directly from a client component (not via
 * useActionState/<form>), same direct-call pattern as previewSegmentAction.
 */
export async function suggestUsersAction(q: string): Promise<UserSuggestion[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  return apiGet<UserSuggestion[]>(`/v1/admin/users/suggest?q=${encodeURIComponent(trimmed)}&limit=8`);
}

export async function banUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = String(formData.get("userId") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!userId || !reason) return { error: "A reason is required to ban an account." };
  try {
    await apiPost(`/v1/admin/users/${encodeURIComponent(userId)}/ban`, { reason });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not ban this user." };
  }
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function unbanUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = String(formData.get("userId") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!userId || !reason) return { error: "A reason is required to unban an account." };
  try {
    await apiPost(`/v1/admin/users/${encodeURIComponent(userId)}/unban`, { reason });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not unban this user." };
  }
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function sendUserNotificationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = String(formData.get("userId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!userId || !title || !body) return { error: "Title and body are required." };
  try {
    await apiPost(`/v1/admin/users/${encodeURIComponent(userId)}/notify`, { title, body });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not send this notification." };
  }
  return { success: true };
}

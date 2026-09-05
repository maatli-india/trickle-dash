"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "../api";
import type { ActionState } from "./config";

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

export async function unbanUserAction(userId: string) {
  await apiPost(`/v1/admin/users/${encodeURIComponent(userId)}/unban`);
  revalidatePath("/dashboard/users");
}

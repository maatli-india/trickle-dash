"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "../api";
import type { ActionState } from "./config";

export async function markPayoutPaidAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  const utr = String(formData.get("utr") || "").trim();
  if (!id || !utr) return { error: "A UTR / reference number is required." };
  const paidAtRaw = String(formData.get("paidAt") || "").trim();

  try {
    await apiPost(`/v1/admin/payouts/${encodeURIComponent(id)}/mark-paid`, {
      utr,
      ...(paidAtRaw ? { paidAt: new Date(paidAtRaw).toISOString() } : {}),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not mark this payout paid." };
  }
  revalidatePath("/dashboard/payouts");
  return { success: true };
}

export async function markPayoutFailedAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!id || !reason) return { error: "A reason is required." };

  try {
    await apiPost(`/v1/admin/payouts/${encodeURIComponent(id)}/mark-failed`, { reason });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not mark this payout failed." };
  }
  revalidatePath("/dashboard/payouts");
  return { success: true };
}

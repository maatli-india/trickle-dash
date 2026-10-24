"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "../api";
import type { ActionState } from "./config";

// The pickup-inspection decline, a reported no-show, and a mid-transit
// exception all leave a sender's payment frozen in escrow with no
// policy-computable "whose fault" answer — admin sets the refund amount
// themselves instead (see the backend's ResolveDispute). refundAmount is
// in plain rupees, matching ParcelMatch/CancellationOutcome's own float64
// convention (not minor units like Transaction.amountMinor) — no ×100
// conversion needed here.
export async function resolveDisputeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const matchId = String(formData.get("matchId") || "");
  const refundAmount = Number(formData.get("refundAmount") || 0);
  const reason = String(formData.get("reason") || "").trim();
  if (!matchId) return { error: "Missing request id." };
  if (!reason) return { error: "A reason is required to resolve a dispute." };
  if (!Number.isFinite(refundAmount) || refundAmount < 0) {
    return { error: "Refund amount must be zero or a positive number." };
  }
  try {
    await apiPost(`/v1/admin/parcel-matches/${encodeURIComponent(matchId)}/resolve-dispute`, {
      refundAmount,
      reason,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not resolve this dispute." };
  }
  revalidatePath(`/dashboard/requests/${matchId}`);
  return { success: true };
}

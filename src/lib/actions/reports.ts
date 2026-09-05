"use server";

import { revalidatePath } from "next/cache";
import { apiPatch } from "../api";
import type { Report } from "../types";
import type { ActionState } from "./config";

// Reuses the existing PATCH /v1/reports/admin/{id} endpoint untouched —
// same admin-review action the backend already exposed, just driven from
// the dashboard now.
export async function updateReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return { error: "A status is required." };
  const resolution = String(formData.get("resolution") || "");
  const reporterMessage = String(formData.get("reporterMessage") || "").trim();
  const internalNote = String(formData.get("internalNote") || "").trim();
  const suspendReportedUser = formData.get("suspendReportedUser") === "on";

  try {
    await apiPatch<Report>(`/v1/reports/admin/${encodeURIComponent(id)}`, {
      status,
      ...(resolution ? { resolution } : {}),
      ...(reporterMessage ? { reporterMessage } : {}),
      ...(internalNote ? { internalNote } : {}),
      suspendReportedUser,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update this report." };
  }
  revalidatePath("/dashboard/reports");
  revalidatePath(`/dashboard/reports/${id}`);
  return { success: true };
}

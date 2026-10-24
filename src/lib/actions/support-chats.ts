"use server";

import { revalidatePath } from "next/cache";
import { apiPatch, apiPost } from "../api";
import type { SupportThread } from "../types";
import type { ActionState } from "./config";

// Mints a short-lived, admin-scoped token meant ONLY to be put in the
// support-chat websocket URL's access_token query param. Never store this —
// mint a fresh one immediately before opening each socket. threadId isn't
// sent to the backend (the endpoint takes no body); it's accepted here so a
// call site reads clearly about which thread it's connecting for.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for call-site clarity; the endpoint itself takes no body
export async function mintSupportChatWsToken(threadId?: string): Promise<string> {
  const { accessToken } = await apiPost<{ accessToken: string }>("/v1/admin/auth/short-token");
  return accessToken;
}

// Mirrors updateReportAction's exact shape: useActionState-compatible,
// apiPatch, revalidatePath on both the detail and list routes.
export async function updateSupportChatStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return { error: "A status is required." };
  const assignedAgentId = String(formData.get("assignedAgentId") || "").trim();

  try {
    await apiPatch<SupportThread>(`/v1/admin/support-chats/${encodeURIComponent(id)}`, {
      status,
      ...(assignedAgentId ? { assignedAgentId } : {}),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update this chat." };
  }
  revalidatePath("/dashboard/support-chats");
  revalidatePath(`/dashboard/support-chats/${id}`);
  return { success: true };
}

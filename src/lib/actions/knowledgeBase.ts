"use server";

import { revalidatePath } from "next/cache";
import { apiDelete, apiPatch, apiPost } from "../api";
import type { KnowledgeBaseEntry } from "../types";
import type { ActionState } from "./config";

// "refund, money back" → ["refund", "money back"]; the backend lowercases
// and de-duplicates them.
function parseKeywords(formData: FormData): string[] {
  return String(formData.get("keywords") || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function createKnowledgeBaseEntryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!question || !answer) return { error: "Question and answer are required." };
  const sourceThreadId = String(formData.get("sourceThreadId") || "").trim();
  try {
    await apiPost<KnowledgeBaseEntry>("/v1/admin/knowledge-base", {
      question,
      answer,
      category: String(formData.get("category") || "").trim(),
      keywords: parseKeywords(formData),
      active: formData.get("active") === "on",
      sourceThreadId: sourceThreadId || undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the knowledge base entry." };
  }
  revalidatePath("/dashboard/knowledge-base");
  return { success: true };
}

export async function updateKnowledgeBaseEntryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!id || !question || !answer) return { error: "Question and answer are required." };
  try {
    await apiPatch<KnowledgeBaseEntry>(`/v1/admin/knowledge-base/${encodeURIComponent(id)}`, {
      question,
      answer,
      category: String(formData.get("category") || "").trim(),
      keywords: parseKeywords(formData),
      active: formData.get("active") === "on",
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update the knowledge base entry." };
  }
  revalidatePath("/dashboard/knowledge-base");
  return { success: true };
}

export async function deleteKnowledgeBaseEntryAction(id: string) {
  await apiDelete(`/v1/admin/knowledge-base/${encodeURIComponent(id)}`);
  revalidatePath("/dashboard/knowledge-base");
}

"use server";

import { revalidatePath } from "next/cache";
import { apiPatch } from "../api";
import type { EffectiveConfig } from "../types";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function updateFeatureFlagsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await apiPatch<EffectiveConfig>("/v1/admin/config/feature-flags", {
      userKYCAadhaar: formData.get("userKYCAadhaar") === "on",
      userPhotoVerification: formData.get("userPhotoVerification") === "on",
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update feature flags." };
  }
  revalidatePath("/dashboard/config");
  return { success: true };
}

export async function updateParcelSafetyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const num = (key: string) => {
    const value = formData.get(key);
    return value ? Number(value) : undefined;
  };
  try {
    await apiPatch<EffectiveConfig>("/v1/admin/config/parcel-safety", {
      maxDeclaredValue: num("maxDeclaredValue"),
      maxWeightKg: num("maxWeightKg"),
      cashInstrumentThresholdINR: num("cashInstrumentThresholdINR"),
      urgentReportSLAMinutes: num("urgentReportSLAMinutes"),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update parcel safety settings." };
  }
  revalidatePath("/dashboard/config");
  return { success: true };
}

export async function updateAppVersionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await apiPatch<EffectiveConfig>("/v1/admin/config/app-version", {
      minSupportedVersion: String(formData.get("minSupportedVersion") || "").trim(),
      latestVersion: String(formData.get("latestVersion") || "").trim(),
      forceUpdate: formData.get("forceUpdate") === "on",
      updateMessage: String(formData.get("updateMessage") || "").trim(),
      iosStoreUrl: String(formData.get("iosStoreUrl") || "").trim(),
      androidStoreUrl: String(formData.get("androidStoreUrl") || "").trim(),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update the app-version settings." };
  }
  revalidatePath("/dashboard/config");
  return { success: true };
}

export async function updateProhibitedCategoriesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = String(formData.get("categories") || "");
  const categories = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split("|");
      return { key: key.trim(), label: rest.join("|").trim() || key.trim() };
    });
  if (categories.length === 0) {
    return { error: "Add at least one category (one per line, key | label)." };
  }
  try {
    await apiPatch<EffectiveConfig>("/v1/admin/config/prohibited-categories", { categories });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update the category list." };
  }
  revalidatePath("/dashboard/config");
  return { success: true };
}

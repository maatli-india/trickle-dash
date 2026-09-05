"use server";

import { redirect } from "next/navigation";
import { publicPost } from "../api";
import { clearSession, setSession } from "../session";

export type LoginState = { error?: string } | undefined;

type LoginResponse = { accessToken: string; expiresIn: number; type: string };

// Admin auth (POST /v1/admin/auth/login) is stateless — no refresh token,
// short TTL — so this cookie is a thin wrapper around that one access
// token, not a real session store.
export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const result = await publicPost<LoginResponse>("/v1/admin/auth/login", { username, password });
  if (!result.ok) {
    return { error: result.status === 401 ? "Invalid username or password." : result.message };
  }

  await setSession({
    accessToken: result.data.accessToken,
    username,
    role: "admin",
    expiresAt: Date.now() + (result.data.expiresIn || 3600) * 1000,
  });
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, safeNext } from "@/lib/supabase/config";
import { validateDisplayName, validateEmail, validatePassword } from "@/lib/profile";
import { getProfile, getUser } from "@/server/dal";

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "confirm" | "displayName" | "current", string>>;
  /** non-secret values echoed back so the form keeps them (never passwords) */
  values?: { email?: string; displayName?: string };
};

const NOT_CONFIGURED: FormState = {
  status: "error",
  message: "Accounts aren't switched on yet — this build has no Supabase project connected. See the README's Auth setup.",
};

/** Absolute origin for email links. Prefer the configured site URL. */
async function origin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Human, non-leaky messages for Supabase auth errors. */
function friendly(err: AuthError): string {
  switch (err.code) {
    case "invalid_credentials":
      return "That email and password don't match. Check them and try again.";
    case "email_not_confirmed":
      return "Confirm your email first — we sent you a link when you signed up.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try signing in instead.";
    case "weak_password":
      return "That password is too weak. Use a longer mix of letters, numbers and symbols.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Wait a minute, then try again.";
    case "same_password":
      return "Choose a password you haven't used for this account.";
    case "signup_disabled":
      return "New sign-ups are paused right now.";
    default:
      return "Something went wrong on our side. Please try again.";
  }
}

const str = (f: FormData, k: string) => (typeof f.get(k) === "string" ? (f.get(k) as string) : "");

/* ---------- Register ---------- */

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim().toLowerCase();
  const password = str(form, "password");
  const displayName = str(form, "displayName").trim();
  const values = { email, displayName };

  const fieldErrors: FormState["fieldErrors"] = {};
  const e1 = validateDisplayName(displayName);
  const e2 = validateEmail(email);
  const e3 = validatePassword(password);
  if (e1) fieldErrors.displayName = e1;
  if (e2) fieldErrors.email = e2;
  if (e3) fieldErrors.password = e3;
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values };
  if (!isSupabaseConfigured) return { ...NOT_CONFIGURED, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${await origin()}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { status: "error", message: friendly(error), values };

  // Email confirmation off → we already have a session.
  if (data.session) redirect("/onboarding");

  return {
    status: "success",
    message: `Check ${email} for a confirmation link. It takes you straight into setup.`,
    values,
  };
}

/* ---------- Sign in ---------- */

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim().toLowerCase();
  const password = str(form, "password");
  const next = safeNext(str(form, "next"), "/");

  const fieldErrors: FormState["fieldErrors"] = {};
  const e1 = validateEmail(email);
  if (e1) fieldErrors.email = e1;
  if (!password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values: { email } };
  if (!isSupabaseConfigured) return { ...NOT_CONFIGURED, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: friendly(error), values: { email } };

  const profile = await getProfile();
  redirect(profile && !profile.onboarding_completed_at ? "/onboarding" : next);
}

/* ---------- Sign out ---------- */

export async function signOut(form: FormData) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const everywhere = form.get("scope") === "global";
    await supabase.auth.signOut({ scope: everywhere ? "global" : "local" });
  }
  redirect("/?signed-out=1");
}

/* ---------- Forgot password ---------- */

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim().toLowerCase();
  const e1 = validateEmail(email);
  if (e1) return { status: "error", fieldErrors: { email: e1 }, values: { email } };
  if (!isSupabaseConfigured) return { ...NOT_CONFIGURED, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
  });
  if (error && (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit")) {
    return { status: "error", message: friendly(error), values: { email } };
  }
  // Same answer whether or not the account exists (no account enumeration).
  return {
    status: "success",
    message: `If an account exists for ${email}, a reset link is on its way. It expires in an hour.`,
    values: { email },
  };
}

/* ---------- Set a new password (recovery link or signed-in change) ---------- */

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = str(form, "password");
  const confirm = str(form, "confirm");
  const fieldErrors: FormState["fieldErrors"] = {};
  const e1 = validatePassword(password);
  if (e1) fieldErrors.password = e1;
  if (password !== confirm) fieldErrors.confirm = "Passwords don't match.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const user = await getUser();
  if (!user) return { status: "error", message: "Your reset link has expired. Request a new one." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: friendly(error) };

  if (form.get("from") === "reset") redirect("/?password-updated=1");
  return { status: "success", message: "Password updated." };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ONBOARDING_STEPS,
  cleanFormats,
  cleanLanguage,
  cleanNotifications,
  cleanPlatforms,
  cleanSports,
  cleanUniverse,
  isValidTimeZone,
  toProfile,
  validateDisplayName,
  type Profile,
} from "@/lib/profile";
import { getUser } from "@/server/dal";

export type ProfilePatch = Partial<
  Pick<
    Profile,
    "display_name" | "favorite_sports" | "home_universe" | "platforms" | "formats" | "time_zone" | "language" | "notifications"
  >
>;

export type SaveResult = { ok: true; profile: Profile } | { ok: false; error: string; field?: string };

/**
 * Validate an untrusted patch into a DB-safe update. Unknown keys are dropped;
 * values are clamped to the allowed sets (DB constraints double-check).
 */
function sanitize(patch: unknown): { update: Record<string, unknown>; error?: { error: string; field: string } } {
  const p = (patch && typeof patch === "object" ? patch : {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  if ("display_name" in p) {
    const name = typeof p.display_name === "string" ? p.display_name.trim() : "";
    const err = validateDisplayName(name);
    if (err) return { update, error: { error: err, field: "display_name" } };
    update.display_name = name;
  }
  if ("favorite_sports" in p) update.favorite_sports = cleanSports(p.favorite_sports);
  if ("home_universe" in p) update.home_universe = cleanUniverse(p.home_universe);
  if ("platforms" in p) update.platforms = cleanPlatforms(p.platforms);
  if ("formats" in p) update.formats = cleanFormats(p.formats);
  if ("language" in p) update.language = cleanLanguage(p.language);
  if ("notifications" in p) update.notifications = cleanNotifications(p.notifications);
  if ("time_zone" in p) {
    const tz = typeof p.time_zone === "string" ? p.time_zone : "";
    if (!isValidTimeZone(tz)) return { update, error: { error: "Choose a valid time zone.", field: "time_zone" } };
    update.time_zone = tz;
  }
  return { update };
}

async function write(update: Record<string, unknown>): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again to save." };

  const supabase = await createClient();
  // .eq on the user's own id + RLS policy = a user can only ever touch their own row.
  const { data, error } = await supabase.from("profiles").update(update).eq("id", user.id).select("*").maybeSingle();
  if (error || !data) return { ok: false, error: "We couldn't save that. Check your connection and try again." };
  revalidatePath("/account");
  return { ok: true, profile: toProfile(data) };
}

/** Save one onboarding step (partial progress survives leaving mid-way). */
export async function saveOnboardingStep(patch: ProfilePatch, step: number): Promise<SaveResult> {
  const { update, error } = sanitize(patch);
  if (error) return { ok: false, ...error };
  const s = Number.isInteger(step) ? Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, step)) : 0;
  return write({ ...update, onboarding_step: s });
}

/** Finish (or skip the rest of) onboarding. */
export async function completeOnboarding(patch: ProfilePatch): Promise<SaveResult> {
  const { update, error } = sanitize(patch);
  if (error) return { ok: false, ...error };
  return write({ ...update, onboarding_step: ONBOARDING_STEPS.length - 1, onboarding_completed_at: new Date().toISOString() });
}

/** Account page edits. */
export async function updateProfile(patch: ProfilePatch): Promise<SaveResult> {
  const { update, error } = sanitize(patch);
  if (error) return { ok: false, ...error };
  if (Object.keys(update).length === 0) return { ok: false, error: "Nothing to save." };
  return write(update);
}

/** Restart onboarding from the account page. */
export async function restartOnboarding(): Promise<SaveResult> {
  return write({ onboarding_step: 0, onboarding_completed_at: null });
}

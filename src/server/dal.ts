import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { toProfile, type Profile } from "@/lib/profile";

/**
 * Data Access Layer — the authoritative auth check. Every protected page and
 * every server action goes through here; the proxy is only an optimistic gate.
 */

/** The verified current user (validated with Supabase Auth), or null. */
export const getUser = cache(async (): Promise<User | null> => {
  // Always evaluate per request — never let an auth decision be prerendered.
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
});

/** Require a user or redirect to login (preserving where they were going). */
export async function requireUser(next: string): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** The current user's profile. RLS guarantees only their own row is readable. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) return toProfile(data);
  // Trigger should have created the row; create it if this project predates the trigger.
  const { data: created } = await supabase.from("profiles").insert({ id: user.id }).select("*").maybeSingle();
  return created ? toProfile(created) : null;
});

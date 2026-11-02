/**
 * Supabase configuration. Only *public* values live here: the project URL
 * and the publishable (anon) key are designed to ship to browsers — data is
 * protected by Row Level Security, not by hiding these. No service-role or
 * secret key is used anywhere in this app.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True once the project URL + publishable key are provided (see README → Auth setup). */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Google sign-in appears only after the provider is enabled in Supabase. */
export const isGoogleEnabled = isSupabaseConfigured && process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

/** Routes that require a signed-in user. */
export const PROTECTED_PREFIXES = ["/onboarding", "/account"];
/** Routes a signed-in user doesn't need (sent to the dashboard instead). */
export const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

/**
 * Only allow same-site relative redirects (blocks open-redirects such as
 * `//evil.com` or `https://evil.com`).
 */
export function safeNext(next: string | null | undefined, fallback = "/") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

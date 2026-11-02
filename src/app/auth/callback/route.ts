import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, safeNext } from "@/lib/supabase/config";

/**
 * Landing point for every auth link:
 *  - OAuth (Google) and PKCE email links arrive with `?code=` → exchange for a session
 *  - token-hash email templates arrive with `?token_hash=&type=` → verify OTP
 * Then continue to `next` (same-site paths only).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"), "/");
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, url.origin));

  if (!isSupabaseConfigured) return fail("not-configured");

  // Provider-side errors (e.g. user cancelled Google consent)
  if (url.searchParams.get("error")) return fail("provider");

  const supabase = await createClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail("link");
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail("link");
  } else {
    return fail("link");
  }

  // New accounts (email confirm or first Google sign-in) go through onboarding.
  if (next === "/" || next === "/onboarding") {
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data } = await supabase.from("profiles").select("onboarding_completed_at").eq("id", auth.user.id).maybeSingle();
      if (!data?.onboarding_completed_at) return NextResponse.redirect(new URL("/onboarding", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

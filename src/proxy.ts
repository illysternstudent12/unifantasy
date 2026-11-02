import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { GUEST_ONLY, PROTECTED_PREFIXES, SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Runs before every page request:
 * 1. Refreshes the Supabase session cookie (keeps users signed in).
 * 2. Optimistic route guards — protected pages bounce signed-out visitors to
 *    /login, guest-only pages bounce signed-in users to the dashboard.
 * Pages re-check on the server (src/server/dal.ts); this is not the only gate.
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // getUser() validates the token with Supabase Auth (never trust cookies alone).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isGuestOnly = GUEST_ONLY.includes(pathname);

  if (!user && (isProtected || pathname === "/reset-password")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/reset-password" ? "/forgot-password" : "/login";
    url.search = pathname === "/reset-password" ? "?expired=1" : `?next=${encodeURIComponent(pathname + search)}`;
    return redirectWithCookies(url, response);
  }

  if (user && isGuestOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

/** Carry refreshed session cookies onto a redirect response. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const res = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export const config = {
  // Skip static assets, images and metadata files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

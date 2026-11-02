import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/**
 * Per-request Supabase client for Server Components, Server Actions and Route
 * Handlers. Auth state lives in httpOnly-capable cookies managed by @supabase/ssr.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component (read-only cookies). The proxy
          // refreshes sessions, so this is safe to ignore.
        }
      },
    },
  });
}

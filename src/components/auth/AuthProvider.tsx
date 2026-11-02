"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { toProfile, type Profile } from "@/lib/profile";
import { sportStore } from "@/lib/preferences";

/**
 * Client-side view of the session, for UI only (menus, greetings,
 * personalisation). It never authorises anything — server actions and
 * protected pages verify the user themselves, and RLS guards the data.
 */
type AuthState = {
  status: "unconfigured" | "loading" | "signed-out" | "signed-in";
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
  setProfile: (p: Profile) => void;
};

const AuthContext = createContext<AuthState>({
  status: isSupabaseConfigured ? "loading" : "unconfigured",
  user: null,
  profile: null,
  setProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

const APPLIED_KEY = "uf:home-applied";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<Omit<AuthState, "setProfile">>({
    status: isSupabaseConfigured ? "loading" : "unconfigured",
    user: null,
    profile: null,
  });
  const userId = useRef<string | null>(null);

  const setProfile = useCallback((profile: Profile) => setState((s) => ({ ...s, profile })), []);

  const sync = useCallback(async () => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    if (!user) {
      userId.current = null;
      sessionStorage.removeItem(APPLIED_KEY);
      setState({ status: "signed-out", user: null, profile: null });
      return;
    }
    if (user.id === userId.current) return;
    userId.current = user.id;

    const { data: row } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    const profile = row ? toProfile(row) : null;
    setState({ status: "signed-in", user: { id: user.id, email: user.email ?? null }, profile });

    // Restore the saved home universe once per sign-in session — unless the
    // user is on a Universe page, where the URL decides.
    if (profile?.onboarding_completed_at && sessionStorage.getItem(APPLIED_KEY) !== user.id) {
      sessionStorage.setItem(APPLIED_KEY, user.id);
      if (!window.location.pathname.startsWith("/universe")) {
        document.documentElement.dataset.sport = profile.home_universe;
        sportStore.set(profile.home_universe);
      }
    }
  }, []);

  // Re-check on every navigation (server actions sign in/out then redirect).
  useEffect(() => {
    // Syncing with an external system (the auth session); state updates happen
    // after the async session read, not synchronously in the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void sync();
  }, [pathname, sync]);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") userId.current = null;
      // defer: never await Supabase calls inside this callback
      setTimeout(() => void sync(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [sync]);

  return <AuthContext.Provider value={{ ...state, setProfile }}>{children}</AuthContext.Provider>;
}

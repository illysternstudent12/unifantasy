"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { signOut } from "@/app/actions/auth";

/** Top-bar account control: "Sign in" when signed out, avatar menu when signed in. */
export function UserMenu() {
  const { status, user, profile } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // close on outside click / Escape / navigation
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  if (status === "unconfigured" || status === "loading") return null;

  if (status === "signed-out") {
    if (pathname === "/login" || pathname === "/register") return null;
    return (
      <Link href={`/login${pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : ""}`} className="signin-btn">
        <LogIn size={16} aria-hidden="true" />
        <span>Sign in</span>
      </Link>
    );
  }

  const name = profile?.display_name || user?.email || "Account";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className="usermenu" ref={ref}>
      <button
        type="button"
        className="usermenu__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">{initial}</span>
      </button>
      {open && (
        <div id={menuId} className="usermenu__pop" role="menu">
          <div className="usermenu__who">
            <strong>{profile?.display_name ?? "Signed in"}</strong>
            <small>{user?.email}</small>
          </div>
          {profile && !profile.onboarding_completed_at && (
            <Link href="/onboarding" role="menuitem" className="usermenu__item usermenu__item--accent">
              Finish setup
            </Link>
          )}
          <Link href="/account" role="menuitem" className="usermenu__item">
            <UserRound size={16} aria-hidden="true" /> Account
          </Link>
          <Link href="/settings" role="menuitem" className="usermenu__item">
            <Settings size={16} aria-hidden="true" /> Display settings
          </Link>
          <form action={signOut}>
            <button type="submit" role="menuitem" className="usermenu__item">
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

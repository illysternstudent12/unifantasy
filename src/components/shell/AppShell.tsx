"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Ellipsis, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NAV, hrefFor, isActive, navFor } from "@/lib/nav";
import { updatePrefs, usePrefs, useUniverse } from "@/lib/preferences";
import { universeHref } from "@/lib/universe";
import { SportBall } from "@/components/art/SportBall";
import { Particles } from "@/components/art/Particles";
import { LogoMark, Wordmark } from "./Logo";
import { SportSwitcherInline, SportSwitcherSheet } from "./SportSwitcher";
import { PrefsSync } from "./PrefsSync";
import { cn } from "@/lib/cn";

const HISTORY_KEY = "uf:nav-depth";

export function AppShell({ children }: { children: ReactNode }) {
  const prefs = usePrefs();
  const { selection } = useUniverse();
  const collapsed = prefs.sidebarCollapsed;

  return (
    <div className={cn("shell", collapsed ? "shell--collapsed" : "shell--open")}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <PrefsSync />
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere__beams" />
        <div className="atmosphere__orb" />
        <div className="atmosphere__prism" />
        <Particles key={selection} selection={selection} />
      </div>
      <div className="grain" aria-hidden="true" />
      <Sidebar collapsed={collapsed} />
      <TopBar />
      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

/* ---------- Desktop sidebar ---------- */

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { selection, meta } = useUniverse();
  return (
    <nav className="sidebar" aria-label="Primary" style={{ viewTransitionName: "uf-sidebar" }}>
      <Link href="/" className="sidebar__brand" aria-label="UniFantasy home">
        <LogoMark size={40} />
        <Wordmark className="sidebar__label" />
      </Link>
      <ul className="sidebar__list">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={hrefFor(item, selection)}
                className={cn("sidebar__link", active && "is-active")}
                aria-current={active ? "page" : undefined}
                title={collapsed ? `${item.label} — ${item.blurb(meta)}` : item.blurb(meta)}
              >
                <span className="sidebar__icon">
                  <Icon size={21} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="sidebar__label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href={universeHref(selection)}
        className="sidebar__universe"
        aria-label={`Current universe: ${meta.league}. Open universe`}
        title={collapsed ? `${meta.league} universe` : undefined}
      >
        <span className="sidebar__universe-ball" aria-hidden="true">
          {selection === "all" ? <span className="prism-dot" /> : <SportBall sport={selection} />}
        </span>
        <span className="sidebar__label sidebar__universe-text">
          <small>Universe</small>
          <strong>{meta.league}</strong>
        </span>
      </Link>
      <button
        className="sidebar__toggle"
        onClick={() => updatePrefs({ sidebarCollapsed: !collapsed })}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!collapsed}
      >
        <span className="sidebar__icon">
          {collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
        </span>
        <span className="sidebar__label">Collapse</span>
      </button>
    </nav>
  );
}

/* ---------- Top bar (both breakpoints) ---------- */

function TopBar() {
  const pathname = usePathname();
  const { meta } = useUniverse();
  const current = navFor(pathname);
  const isHome = pathname === "/";

  return (
    <header className="topbar" style={{ viewTransitionName: "uf-topbar" }}>
      <div className="topbar__left">
        {isHome ? (
          <Link href="/" className="topbar__brand" aria-label="UniFantasy home">
            <LogoMark size={34} />
            <Wordmark />
          </Link>
        ) : (
          <>
            <BackButton />
            <div className="topbar__crumb">
              <span className="topbar__crumb-sport mono">{meta.league}</span>
              <span className="topbar__crumb-page">{current.label}</span>
            </div>
          </>
        )}
      </div>
      <SportSwitcherInline className="topbar__switch" />
      <div className="topbar__mobile-switch">
        <SportSwitcherSheet />
      </div>
    </header>
  );
}

function BackButton() {
  const router = useRouter();

  return (
    <button
      className="back-btn"
      aria-label="Go back"
      onClick={() => {
        // Only step back through history we created, so "Back" never leaves the app.
        const depth = Number(sessionStorage.getItem(HISTORY_KEY) ?? "0");
        if (depth > 0 && window.history.length > 1) router.back();
        else router.push("/", { transitionTypes: ["nav-back"] });
      }}
    >
      <ChevronLeft size={22} aria-hidden="true" />
      <span className="back-btn__label">Back</span>
    </button>
  );
}

/** Counts in-app navigations (used by BackButton). */
export function useNavDepthTracker() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      sessionStorage.setItem(HISTORY_KEY, sessionStorage.getItem(HISTORY_KEY) ?? "0");
      return;
    }
    const d = Number(sessionStorage.getItem(HISTORY_KEY) ?? "0");
    sessionStorage.setItem(HISTORY_KEY, String(d + 1));
  }, [pathname]);
}

/* ---------- Mobile bottom navigation ---------- */

function BottomNav() {
  const pathname = usePathname();
  const { selection } = useUniverse();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  useNavDepthTracker();

  const primary = NAV.filter((n) => n.primaryMobile);
  const secondary = NAV.filter((n) => !n.primaryMobile);
  const moreActive = secondary.some((n) => isActive(pathname, n.href));

  // close the sheet whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (moreOpen) setMoreOpen(false);
  }

  return (
    <>
      <nav className="bottomnav" aria-label="Primary mobile" style={{ viewTransitionName: "uf-bottomnav" }}>
        {primary.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={hrefFor(item, selection)}
              className={cn("bottomnav__item", active && "is-active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{item.short}</span>
            </Link>
          );
        })}
        <button
          ref={moreRef}
          className={cn("bottomnav__item", (moreActive || moreOpen) && "is-active")}
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
        >
          <Ellipsis size={22} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
      {moreOpen && (
        <MoreSheet
          onClose={() => {
            setMoreOpen(false);
            moreRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function MoreSheet({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { selection, meta } = useUniverse();
  const panelRef = useRef<HTMLDivElement>(null);
  const secondary = NAV.filter((n) => !n.primaryMobile);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="sheet" role="dialog" aria-modal="true" aria-label="More destinations">
      <button className="sheet__scrim" aria-label="Close" onClick={onClose} tabIndex={-1} />
      <div className="sheet__panel" ref={panelRef}>
        <div className="sheet__head">
          <span className="kicker">More</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <ul className="more-list">
          {secondary.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link href={hrefFor(item, selection)} className={cn("more-list__link", active && "is-active")} aria-current={active ? "page" : undefined}>
                  <span className="more-list__icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.blurb(meta)}</small>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

import {
  Bot,
  FlaskConical,
  LayoutDashboard,
  Orbit,
  Plug,
  Radar,
  Settings,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { universeHref, type Selection, type UniverseMeta } from "./universe";

export type NavItem = {
  id: string;
  href: string;
  label: string;
  /** short label for the mobile bottom bar */
  short: string;
  icon: LucideIcon;
  /** sport-aware description (terminology follows the active universe) */
  blurb: (m: UniverseMeta) => string;
  /** shown directly in the mobile bottom bar (others live under "More") */
  primaryMobile: boolean;
};

export const NAV: NavItem[] = [
  { id: "dashboard", href: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard, blurb: (m) => `Your ${m.league} season hub`, primaryMobile: true },
  { id: "universe", href: "/universe", label: "Universe", short: "Universe", icon: Orbit, blurb: (m) => (m.id === "all" ? "Explore all six sport universes" : `Step inside the ${m.league} universe`), primaryMobile: false },
  { id: "leagues", href: "/leagues", label: "My Leagues", short: "Leagues", icon: Trophy, blurb: (m) => `Standings, ${m.terms.matchup.toLowerCase()}s and ${m.terms.roster.toLowerCase()}s`, primaryMobile: true },
  { id: "players", href: "/players", label: "Player Intelligence", short: "Players", icon: Radar, blurb: (m) => `Scouting views for ${m.league}`, primaryMobile: true },
  { id: "strategy", href: "/strategy", label: "Strategy Lab", short: "Strategy", icon: FlaskConical, blurb: (m) => `Scoring and ${m.terms.roster.toLowerCase()} construction tools`, primaryMobile: false },
  { id: "copilot", href: "/copilot", label: "AI Copilot", short: "Copilot", icon: Bot, blurb: (m) => `Your ${m.league} co-manager`, primaryMobile: true },
  { id: "connections", href: "/connections", label: "Connections", short: "Connect", icon: Plug, blurb: () => "Link your fantasy platforms", primaryMobile: false },
  { id: "settings", href: "/settings", label: "Settings", short: "Settings", icon: Settings, blurb: () => "Themes, motion and preferences", primaryMobile: false },
];

/** Resolve an item's href for the active universe (Universe follows the selection). */
export function hrefFor(item: NavItem, sel: Selection) {
  return item.id === "universe" ? universeHref(sel) : item.href;
}

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

/** Pages outside the main nav still need an honest breadcrumb label. */
const EXTRA_TITLES: Record<string, string> = {
  "/login": "Sign in",
  "/register": "Create account",
  "/forgot-password": "Reset password",
  "/reset-password": "New password",
  "/onboarding": "Setup",
  "/account": "Account",
};

export function navFor(pathname: string): Pick<NavItem, "label"> {
  const extra = EXTRA_TITLES[pathname];
  if (extra) return { label: extra };
  return NAV.find((n) => isActive(pathname, n.href)) ?? NAV[0];
}

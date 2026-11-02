"use client";

import { flushSync } from "react-dom";
import { useSyncExternalStore } from "react";
import { createPersistedStore } from "./store";
import { DEFAULT_SPORT, SPORTS, isSportId, type Sport, type SportId } from "./sports";
import { isSelection, metaFor, type Selection, type UniverseMeta } from "./universe";
import { SPORT_STORAGE_KEY } from "./sport-key";

export { SPORT_STORAGE_KEY };

/* ---------- Active universe (one sport, or "all") ---------- */

export const sportStore = createPersistedStore<Selection>(SPORT_STORAGE_KEY, DEFAULT_SPORT, isSelection);

/** The raw selection: a sport id or "all". */
export const useSelection = sportStore.useValue;

/**
 * Everything a view needs about the active universe:
 * - `sport` is null in the combined "all" universe
 * - `meta` always exists (copy, terminology, theme name)
 */
export function useUniverse(): { selection: Selection; sport: Sport | null; meta: UniverseMeta } {
  const selection = useSelection();
  return {
    selection,
    sport: isSportId(selection) ? SPORTS[selection] : null,
    meta: metaFor(selection),
  };
}

/* ---------- Preferences ---------- */

export type MotionPref = "system" | "reduced" | "full";

export type Preferences = {
  motion: MotionPref;
  grain: boolean;
  parallax: boolean;
  sidebarCollapsed: boolean;
  favoriteSports: SportId[];
};

export const DEFAULT_PREFS: Preferences = {
  motion: "system",
  grain: true,
  parallax: true,
  sidebarCollapsed: true,
  favoriteSports: [],
};

function isPrefs(v: unknown): v is Preferences {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return (
    (p.motion === "system" || p.motion === "reduced" || p.motion === "full") &&
    typeof p.grain === "boolean" &&
    typeof p.parallax === "boolean" &&
    typeof p.sidebarCollapsed === "boolean" &&
    Array.isArray(p.favoriteSports) &&
    p.favoriteSports.every(isSportId)
  );
}

export const prefsStore = createPersistedStore<Preferences>("uf:prefs", DEFAULT_PREFS, isPrefs);
export const usePrefs = prefsStore.useValue;

export function updatePrefs(patch: Partial<Preferences>) {
  prefsStore.set((p) => ({ ...p, ...patch }));
}

/* ---------- Reduced motion (system + user override) ---------- */

const mq = () =>
  typeof window === "undefined" ? null : window.matchMedia("(prefers-reduced-motion: reduce)");

function subscribeMq(cb: () => void) {
  const m = mq();
  m?.addEventListener("change", cb);
  return () => m?.removeEventListener("change", cb);
}

export function useReducedMotion(): boolean {
  const prefs = usePrefs();
  const system = useSyncExternalStore(subscribeMq, () => !!mq()?.matches, () => false);
  if (prefs.motion === "reduced") return true;
  if (prefs.motion === "full") return false;
  return system;
}

export function isMotionReduced(): boolean {
  const { motion } = prefsStore.get();
  if (motion === "reduced") return true;
  if (motion === "full") return false;
  return !!mq()?.matches;
}

/* ---------- Sport switching with a cinematic reveal ---------- */

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

/**
 * Switch the active sport. When supported (and motion is allowed) the new
 * theme is revealed with a circular wipe from `origin` using the View
 * Transitions API; otherwise it swaps instantly and the CSS color
 * transitions on registered custom properties do the blending.
 */
export function switchSport(id: Selection, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  if (root.dataset.sport === id) return;

  const apply = () => {
    root.dataset.sport = id;
    flushSync(() => sportStore.set(id));
  };

  const doc = document as VTDocument;
  if (!doc.startViewTransition || isMotionReduced()) {
    apply();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.dataset.vt = "sport";
  const t = doc.startViewTransition(apply);
  t.finished.finally(() => {
    delete root.dataset.vt;
  });
}

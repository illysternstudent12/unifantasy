"use client";

import { useEffect } from "react";
import { usePrefs, useSelection } from "@/lib/preferences";
import { metaFor } from "@/lib/universe";

/** Mirrors client preferences onto <html> attributes that CSS keys off. */
export function PrefsSync() {
  const selection = useSelection();
  const prefs = usePrefs();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.sport = selection;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", metaFor(selection).hex.deep);
  }, [selection]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = prefs.motion;
    root.dataset.grain = prefs.grain ? "on" : "off";
  }, [prefs.motion, prefs.grain]);

  return null;
}

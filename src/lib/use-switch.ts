"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { switchSport } from "./preferences";
import { universeHref, type Selection } from "./universe";

/**
 * The one way UI should change sport.
 * - On a Universe page the URL is the source of truth, so we navigate to the
 *   target universe (with a cinematic route transition); the page then syncs
 *   the global theme.
 * - Everywhere else the theme switches in place with a circular reveal.
 */
export function useSwitchUniverse() {
  const pathname = usePathname();
  const router = useRouter();
  return useCallback(
    (sel: Selection, origin?: { x: number; y: number }) => {
      if (pathname.startsWith("/universe")) {
        const href = universeHref(sel);
        if (href !== pathname) router.push(href, { transitionTypes: ["universe"] });
        return;
      }
      switchSport(sel, origin);
    },
    [pathname, router],
  );
}

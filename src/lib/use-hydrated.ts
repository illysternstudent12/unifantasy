"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False during SSR and hydration, true afterwards. Use for values that differ
 * between server and browser (Intl time-zone lists, the detected time zone).
 */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

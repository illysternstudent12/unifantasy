"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny persisted store backed by localStorage.
 * useSyncExternalStore gives us a server snapshot (the default) during SSR and
 * hydration, then swaps to the stored value — no hydration mismatches.
 * This is local UI preference state only; there is no backend in Batch 1.
 */
export function createPersistedStore<T>(
  key: string,
  fallback: T,
  validate: (v: unknown) => v is T,
) {
  let value: T = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (validate(parsed)) value = parsed;
      }
    } catch {
      /* storage blocked or corrupt — keep fallback */
    }
  };

  const get = () => {
    load();
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    load();
    value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  const useValue = () => useSyncExternalStore(subscribe, get, () => fallback);

  return { get, set, subscribe, useValue, key };
}

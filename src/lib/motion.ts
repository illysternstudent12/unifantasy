"use client";

import { useEffect, useRef, useState } from "react";
import { prefsStore, isMotionReduced } from "./preferences";

/* ---------- Scroll reveal: one shared IntersectionObserver ---------- */

let io: IntersectionObserver | null = null;

function getObserver() {
  if (io || typeof window === "undefined") return io;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io?.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );
  return io;
}

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = getObserver();
    if (!obs || isMotionReduced()) {
      el.classList.add("is-in");
      return;
    }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return ref;
}

/* ---------- Parallax: one shared rAF scroll loop ---------- */

type Entry = { el: HTMLElement; speed: number };
const entries = new Set<Entry>();
let ticking = false;
let bound = false;

function frame() {
  ticking = false;
  const reduced = isMotionReduced() || !prefsStore.get().parallax;
  const vh = window.innerHeight;
  document.documentElement.style.setProperty("--scroll", reduced ? "0" : String(window.scrollY));
  for (const { el, speed } of entries) {
    if (reduced) {
      el.style.setProperty("--py", "0px");
      continue;
    }
    const r = el.getBoundingClientRect();
    // offset relative to viewport centre
    const delta = r.top + r.height / 2 - vh / 2;
    el.style.setProperty("--py", `${(-delta * speed).toFixed(1)}px`);
  }
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
}

export function useParallax<T extends HTMLElement>(speed = 0.15) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const entry = { el, speed };
    entries.add(entry);
    if (!bound) {
      bound = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      prefsStore.subscribe(onScroll);
    }
    onScroll();
    return () => {
      entries.delete(entry);
    };
  }, [speed]);
  return ref;
}

/* ---------- Lazy mount: render heavy art only near the viewport ---------- */

export function useInView<T extends HTMLElement>(enabled = true, rootMargin = "300px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(!enabled);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, rootMargin]);
  return [ref, inView] as const;
}

/* ---------- Pointer tilt (mouse + touch drag), off for reduced motion ---------- */

export function useTilt<T extends HTMLElement>(max = 8) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      if (isMotionReduced()) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
        el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("pointerup", reset);
    el.addEventListener("pointercancel", reset);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      el.removeEventListener("pointerup", reset);
      el.removeEventListener("pointercancel", reset);
    };
  }, [max]);
  return ref;
}

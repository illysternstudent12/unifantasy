import { ViewTransition, type ReactNode } from "react";

/**
 * Wrap each page's content. Route navigations are React transitions, so the
 * old page lifts away and the new one rises in; "Back" uses a lateral slide.
 * Must live in page.tsx (layouts persist and never enter/exit).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-back": "nav-back", universe: "universe-in", default: "page-in" }}
      exit={{ "nav-back": "nav-back", universe: "universe-out", default: "page-out" }}
      default="none"
    >
      <div className="page">{children}</div>
    </ViewTransition>
  );
}

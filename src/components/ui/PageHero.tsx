"use client";

import type { ReactNode } from "react";
import { SportScene } from "@/components/art/SportScene";
import { useUniverse } from "@/lib/preferences";
import { Reveal } from "./primitives";

/** Full-bleed cinematic header shared by every inner screen. */
export function PageHero({
  kicker,
  title,
  outline,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  outline?: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  const { selection, meta } = useUniverse();
  return (
    <section className="page-hero">
      <SportScene key={selection} sport={selection} variant="banner" backdrop />
      <div className="container">
        <div className="page-hero__content">
          <Reveal>
            <span className="kicker">
              {meta.league} · {kicker}
            </span>
          </Reveal>
          <Reveal as="h1" className="display page-hero__title" delay={80}>
            {title}
            {outline && (
              <>
                <br />
                <span className="text-outline">{outline}</span>
              </>
            )}
          </Reveal>
          {lede && (
            <Reveal delay={160}>
              <p className="lede">{lede}</p>
            </Reveal>
          )}
          {children && <Reveal delay={220}>{children}</Reveal>}
        </div>
      </div>
    </section>
  );
}

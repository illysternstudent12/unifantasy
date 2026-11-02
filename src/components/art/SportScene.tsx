"use client";

import Image from "next/image";
import { SportBall } from "./SportBall";
import { FieldLines } from "./FieldLines";
import { ArenaBackdrop } from "./ArenaBackdrop";
import { SPORT_MEDIA } from "@/lib/media";
import { useInView, useParallax } from "@/lib/motion";
import { SPORT_IDS } from "@/lib/sports";
import type { Selection } from "@/lib/universe";
import { cn } from "@/lib/cn";

type Props = {
  sport: Selection;
  variant?: "hero" | "banner" | "poster" | "universe";
  className?: string;
  /** parallax strength of the hero object */
  depth?: number;
  /** render the arena environment (crowd, rig, landmark) */
  backdrop?: boolean;
  /** defer rendering the heavy art until the scene nears the viewport */
  lazy?: boolean;
};

/**
 * Layered cinematic scene: environment → spotlight → perspective playing
 * surface → motion streaks → hero object with contact shadow → photography.
 * In the "all" universe the hero object becomes a six-ball constellation.
 */
export function SportScene({ sport, variant = "hero", className, depth = 0.12, backdrop = false, lazy = false }: Props) {
  const objRef = useParallax<HTMLDivElement>(depth);
  const floorRef = useParallax<HTMLDivElement>(depth * 0.35);
  const envRef = useParallax<HTMLDivElement>(depth * -0.25);
  const [boxRef, inView] = useInView<HTMLDivElement>(lazy);
  const media = sport === "all" ? {} : SPORT_MEDIA[sport];
  const show = !lazy || inView;

  return (
    <div ref={boxRef} className={cn("scene", `scene--${variant}`, `scene--${sport}`, className)} aria-hidden="true">
      {show && (
        <>
          {media.hero && (
            <Image
              src={media.hero}
              alt=""
              fill
              priority={variant === "hero" || variant === "universe"}
              loading={variant === "hero" || variant === "universe" ? undefined : "lazy"}
              sizes="100vw"
              className="scene__photo"
              style={{ objectPosition: media.focus ?? "center" }}
            />
          )}
          {backdrop && sport !== "all" && (
            <div ref={envRef} className="scene__env parallax">
              <ArenaBackdrop sport={sport} />
            </div>
          )}
          <div className="scene__spot" />
          {sport !== "all" && (
            <div ref={floorRef} className="scene__floor-wrap parallax">
              <FieldLines sport={sport} className="scene__floor" />
            </div>
          )}
          <div className="scene__streaks">
            <span />
            <span />
            <span />
          </div>
          <div ref={objRef} className="scene__object-wrap parallax">
            {sport === "all" ? (
              <div className="constellation">
                {SPORT_IDS.map((id, i) => (
                  <span key={id} data-sport={id} className={`constellation__orb constellation__orb--${i}`}>
                    <SportBall sport={id} className="scene__ball" />
                  </span>
                ))}
              </div>
            ) : (
              <>
                <div className="scene__object">
                  <SportBall sport={sport} className="scene__ball" />
                </div>
                <div className="scene__shadow" />
              </>
            )}
          </div>
          <div className="scene__vignette" />
        </>
      )}
    </div>
  );
}

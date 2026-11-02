import { useMemo, type CSSProperties } from "react";
import type { Selection } from "@/lib/universe";
import { hashString, seeded } from "@/lib/seeded";

/**
 * Ambient particle field per universe — embers, sparks, snow, drizzle, dust.
 * Pure CSS animation with deterministic positions; hidden for reduced motion.
 */
const KIND: Record<Selection, string> = {
  nba: "embers",
  euroleague: "sparks",
  nfl: "dust",
  soccer: "drizzle",
  mlb: "motes",
  nhl: "snow",
  all: "prism",
};

export function Particles({ selection, count = 34 }: { selection: Selection; count?: number }) {
  const items = useMemo(() => {
    const rnd = seeded(hashString("p-" + selection));
    return Array.from({ length: count }, () => ({
      x: Math.round(rnd() * 1000) / 10,
      y: Math.round(rnd() * 1000) / 10,
      s: Math.round((1 + rnd() * 3.5) * 10) / 10,
      d: Math.round(rnd() * 120) / 10,
      t: Math.round((7 + rnd() * 9) * 10) / 10,
      drift: Math.round((rnd() * 2 - 1) * 60),
    }));
  }, [selection, count]);

  return (
    <div className={`particles particles--${KIND[selection]}`} aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          style={
            {
              "--x": `${p.x}%`,
              "--y": `${p.y}%`,
              "--s": `${p.s}px`,
              "--d": `-${p.d}s`,
              "--t": `${p.t}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

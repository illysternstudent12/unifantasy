import { useMemo } from "react";
import type { SportId } from "@/lib/sports";
import { hashString, seeded } from "@/lib/seeded";
import { cn } from "@/lib/cn";

/**
 * Environment layer for a Sport Universe: roof light rig, crowd bowl bokeh and
 * a sport landmark (hoop, goalposts, floodlights, foul pole, boards, flares).
 * Silhouettes are drawn in theme light so each universe reads at a glance.
 */
export function ArenaBackdrop({ sport, className }: { sport: SportId; className?: string }) {
  const crowd = useMemo(() => buildCrowd(sport), [sport]);
  const lamps = LAMPS[sport];
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={cn("arena", `arena--${sport}`, className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`lamp-${sport}`}>
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="18%" style={{ stopColor: "var(--accent-2)" }} stopOpacity="0.55" />
          <stop offset="100%" style={{ stopColor: "var(--accent)" }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`beam-${sport}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--accent-2)" }} stopOpacity="0.32" />
          <stop offset="100%" style={{ stopColor: "var(--accent)" }} stopOpacity="0" />
        </linearGradient>
        <filter id={`soft-${sport}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      {/* crowd bowl */}
      <g className="arena__crowd">
        {crowd.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            className={d.flash ? "arena__flash" : undefined}
            style={{ fill: d.accent ? "var(--accent-2)" : "#fff", animationDelay: d.flash ? `${d.delay}s` : undefined }}
            opacity={d.o}
          />
        ))}
      </g>

      {/* roof light rig */}
      {lamps.count > 0 && (
      <g className="arena__rig">
        <line x1="-20" y1={lamps.y} x2="1620" y2={lamps.y} stroke="rgb(255 255 255 / 0.18)" strokeWidth="3" />
        {Array.from({ length: lamps.count }, (_, i) => {
          const x = 80 + (i * 1440) / (lamps.count - 1);
          return (
            <g key={i} className="arena__lamp" style={{ animationDelay: `${(i % 5) * 0.7}s` }}>
              <polygon points={`${x - 10},${lamps.y} ${x + 10},${lamps.y} ${x + 120},${lamps.y + 520} ${x - 120},${lamps.y + 520}`} fill={`url(#beam-${sport})`} opacity="0.35" />
              <circle cx={x} cy={lamps.y} r="46" fill={`url(#lamp-${sport})`} />
              <circle cx={x} cy={lamps.y} r="5" fill="#fff" />
            </g>
          );
        })}
      </g>
      )}

      <g className="arena__landmark">{LANDMARKS[sport](sport)}</g>
    </svg>
  );
}

type Dot = { x: number; y: number; r: number; o: number; accent: boolean; flash: boolean; delay: number };

function buildCrowd(sport: SportId): Dot[] {
  const rnd = seeded(hashString(sport));
  const dots: Dot[] = [];
  const tiers = 4;
  for (let t = 0; t < tiers; t++) {
    const base = 300 + t * 70;
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 1700 - 50;
      const curve = ((x - 800) / 800) ** 2 * -90; // bowl rises toward the sides
      dots.push({
        x,
        y: base + curve + rnd() * 50,
        r: 1.2 + rnd() * (2.6 - t * 0.3),
        o: 0.12 + rnd() * 0.45,
        accent: rnd() > 0.55,
        flash: rnd() > 0.96,
        delay: Math.round(rnd() * 60) / 10,
      });
    }
  }
  return dots;
}

const LAMPS: Record<SportId, { count: number; y: number }> = {
  nba: { count: 9, y: 60 },
  euroleague: { count: 7, y: 50 },
  nfl: { count: 11, y: 40 },
  // open-air venues use floodlight towers / light banks instead of a roof rig
  soccer: { count: 0, y: 0 },
  mlb: { count: 0, y: 0 },
  nhl: { count: 9, y: 70 },
};

const sil = { stroke: "var(--accent-2)", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Hoop({ x, flip = false }: { x: number; flip?: boolean }) {
  const d = flip ? -1 : 1;
  return (
    <g opacity="0.75">
      <rect x={x - 110} y="300" width="220" height="140" rx="6" style={{ fill: "rgb(255 255 255 / 0.06)" }} {...sil} strokeWidth="4" />
      <rect x={x - 40} y="370" width="80" height="58" fill="none" {...sil} strokeWidth="3" />
      <ellipse cx={x} cy="458" rx="46" ry="9" fill="none" {...sil} style={{ stroke: "var(--accent)" }} strokeWidth="6" />
      {Array.from({ length: 7 }, (_, i) => {
        const sx = x - 44 + i * 14.6;
        return <line key={i} x1={sx} y1="460" x2={x - 24 + i * 8} y2="530" fill="none" {...sil} strokeWidth="2" opacity="0.6" />;
      })}
      <path d={`M${x} 440 L${x + d * 60} 470 L${x + d * 200} 880`} fill="none" {...sil} strokeWidth="14" opacity="0.5" />
    </g>
  );
}

function Floodlight({ x, mirror = false }: { x: number; mirror?: boolean }) {
  const lean = mirror ? -1 : 1;
  return (
    <g>
      <polygon points={`${x - 90},140 ${x + 90},140 ${x + lean * 520 + 300},900 ${x + lean * 520 - 300},900`} fill="url(#beam-soccer)" opacity="0.4" />
      <line x1={x} y1="900" x2={x} y2="180" fill="none" {...sil} strokeWidth="8" opacity="0.55" />
      <rect x={x - 80} y="100" width="160" height="80" rx="6" fill="rgb(0 0 0 / 0.4)" {...sil} strokeWidth="3" opacity="0.8" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={x - 60 + (i % 6) * 24} cy={120 + Math.floor(i / 6) * 36} r="9" fill="#fff" className="arena__bulb" style={{ animationDelay: `${i * 0.13}s` }} />
      ))}
      <circle cx={x} cy="140" r="160" style={{ fill: "var(--accent-2)" }} opacity="0.18" filter="url(#soft-soccer)" />
    </g>
  );
}

const LANDMARKS: Record<SportId, (s: SportId) => React.ReactNode> = {
  nba: () => (
    <>
      {/* centre-hung scoreboard */}
      <g opacity="0.8">
        <line x1="700" y1="0" x2="700" y2="120" fill="none" {...sil} strokeWidth="2" opacity="0.5" />
        <line x1="900" y1="0" x2="900" y2="120" fill="none" {...sil} strokeWidth="2" opacity="0.5" />
        <rect x="620" y="120" width="360" height="130" rx="10" fill="rgb(0 0 0 / 0.55)" {...sil} strokeWidth="3" />
        <rect x="640" y="138" width="320" height="94" rx="4" style={{ fill: "var(--accent)" }} opacity="0.22" className="arena__screen" />
        <rect x="660" y="250" width="280" height="22" rx="4" style={{ fill: "var(--accent)" }} opacity="0.5" />
      </g>
      <Hoop x={1290} />
    </>
  ),
  euroleague: () => (
    <>
      <Hoop x={1300} />
      {/* smoke */}
      <g filter="url(#soft-euroleague)" className="arena__smoke">
        <ellipse cx="300" cy="520" rx="320" ry="70" fill="#fff" opacity="0.08" />
        <ellipse cx="900" cy="480" rx="380" ry="80" style={{ fill: "var(--accent-2)" }} opacity="0.1" />
        <ellipse cx="1400" cy="540" rx="300" ry="60" fill="#fff" opacity="0.07" />
      </g>
      {/* flares in the stands */}
      {[180, 420, 610, 1010, 1180, 1500].map((x, i) => (
        <g key={x} className="arena__flare" style={{ animationDelay: `${i * 0.37}s` }}>
          <circle cx={x} cy={400 + (i % 3) * 40} r="60" fill="#ff3b5c" opacity="0.25" filter="url(#soft-euroleague)" />
          <circle cx={x} cy={400 + (i % 3) * 40} r="6" fill="#fff" />
        </g>
      ))}
    </>
  ),
  nfl: () => (
    <>
      <path d="M-50 260 Q 800 120 1650 260" fill="none" {...sil} strokeWidth="5" opacity="0.4" />
      <path d="M-50 300 Q 800 170 1650 300" fill="none" {...sil} strokeWidth="2" opacity="0.3" />
      <g opacity="0.85" style={{ stroke: "var(--accent-2)" }} strokeLinecap="round" fill="none">
        <line x1="1300" y1="860" x2="1300" y2="470" strokeWidth="14" />
        <line x1="1120" y1="470" x2="1480" y2="470" strokeWidth="12" />
        <line x1="1120" y1="470" x2="1120" y2="150" strokeWidth="9" />
        <line x1="1480" y1="470" x2="1480" y2="150" strokeWidth="9" />
      </g>
      <rect x="1100" y="120" width="40" height="18" rx="3" style={{ fill: "var(--accent)" }} className="arena__pennant" />
      <rect x="1460" y="120" width="40" height="18" rx="3" style={{ fill: "var(--accent)" }} className="arena__pennant" />
    </>
  ),
  soccer: () => (
    <>
      <Floodlight x={160} />
      <Floodlight x={1440} mirror />
      <defs>
        <pattern id="net-soccer" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 0 L18 18 M18 0 L0 18" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.2" />
        </pattern>
      </defs>
      <g opacity="0.8">
        <rect x="1060" y="520" width="380" height="150" fill="url(#net-soccer)" />
        <path d="M1060 670 L1060 520 L1440 520 L1440 670" fill="none" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
      </g>
    </>
  ),
  mlb: () => (
    <>
      {/* light banks */}
      {[200, 1400].map((x) => (
        <g key={x}>
          <line x1={x} y1="900" x2={x} y2="200" fill="none" {...sil} strokeWidth="9" opacity="0.5" />
          <rect x={x - 110} y="110" width="220" height="100" rx="6" fill="rgb(0 0 0 / 0.45)" {...sil} strokeWidth="3" />
          {Array.from({ length: 15 }, (_, i) => (
            <circle key={i} cx={x - 88 + (i % 5) * 44} cy={132 + Math.floor(i / 5) * 28} r="9" fill="#fff" className="arena__bulb" style={{ animationDelay: `${i * 0.11}s` }} />
          ))}
          <circle cx={x} cy="160" r="200" style={{ fill: "var(--accent-2)" }} opacity="0.16" filter="url(#soft-mlb)" />
        </g>
      ))}
      {/* outfield wall + foul pole */}
      <path d="M-50 600 Q 800 470 1650 600" fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="26" opacity="0.55" />
      <path d="M-50 585 Q 800 455 1650 585" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" />
      <line x1="1530" y1="610" x2="1530" y2="280" stroke="#ffd447" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
    </>
  ),
  nhl: () => (
    <>
      {/* hanging banners */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} opacity="0.6">
          <line x1={360 + i * 180} y1="70" x2={360 + i * 180} y2="110" fill="none" {...sil} strokeWidth="2" />
          <rect x={320 + i * 180} y="110" width="80" height="120" rx="3" fill="rgb(0 0 0 / 0.35)" {...sil} strokeWidth="2" />
          <rect x={320 + i * 180} y="200" width="80" height="12" style={{ fill: "var(--accent)" }} />
        </g>
      ))}
      {/* boards + glass */}
      <rect x="-20" y="520" width="1640" height="150" style={{ fill: "var(--accent-2)" }} opacity="0.06" />
      <line x1="-20" y1="520" x2="1620" y2="520" fill="none" {...sil} strokeWidth="3" opacity="0.6" />
      <line x1="-20" y1="670" x2="1620" y2="670" style={{ stroke: "var(--accent)" }} strokeWidth="10" opacity="0.6" />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={i * 125} y1="520" x2={i * 125} y2="670" fill="none" {...sil} strokeWidth="2" opacity="0.35" />
      ))}
      <path d="M200 540 L420 660" stroke="#fff" strokeWidth="18" opacity="0.06" />
      <path d="M900 540 L1120 660" stroke="#fff" strokeWidth="26" opacity="0.05" />
      {/* goal */}
      <g opacity="0.85">
        <path d="M1180 790 L1180 690 Q 1290 650 1400 690 L1400 790" fill="none" stroke="#ff3d4f" strokeWidth="10" strokeLinejoin="round" />
        <path d="M1190 785 Q 1290 740 1390 785" fill="none" stroke="rgb(255 255 255 / 0.4)" strokeWidth="2" />
      </g>
    </>
  ),
};

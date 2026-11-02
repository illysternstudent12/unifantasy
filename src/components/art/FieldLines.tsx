import type { SportId } from "@/lib/sports";

/**
 * Playing-surface line art (court / field / pitch / diamond / rink), drawn in
 * the theme accent. Rendered flat; CSS puts it into perspective as a floor.
 */
export function FieldLines({ sport, className }: { sport: SportId; className?: string }) {
  const s = {
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: 3,
    vectorEffect: "non-scaling-stroke" as const,
  };
  return (
    <svg viewBox="0 0 1000 600" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <g style={{ ...s }}>{SURFACES[sport]}</g>
    </svg>
  );
}

const court = (
  <>
    <rect x="20" y="20" width="960" height="560" />
    <line x1="500" y1="20" x2="500" y2="580" />
    <circle cx="500" cy="300" r="70" />
    <rect x="20" y="210" width="190" height="180" />
    <rect x="790" y="210" width="190" height="180" />
    <path d="M20 60 L120 60 A 260 260 0 0 1 120 540 L20 540" />
    <path d="M980 60 L880 60 A 260 260 0 0 0 880 540 L980 540" />
    <circle cx="210" cy="300" r="60" />
    <circle cx="790" cy="300" r="60" />
  </>
);

const SURFACES: Record<SportId, React.ReactNode> = {
  nba: court,
  euroleague: (
    <>
      {court}
      <path d="M20 80 L80 80 M20 520 L80 520 M980 80 L920 80 M980 520 L920 520" />
    </>
  ),
  nfl: (
    <>
      <rect x="20" y="40" width="960" height="520" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={100 + i * 80} y1="40" x2={100 + i * 80} y2="560" />
      ))}
      {Array.from({ length: 50 }, (_, i) => (
        <g key={`h${i}`}>
          <line x1={100 + i * 16} y1="230" x2={100 + i * 16} y2="244" />
          <line x1={100 + i * 16} y1="356" x2={100 + i * 16} y2="370" />
        </g>
      ))}
      <rect x="20" y="40" width="80" height="520" style={{ fill: "var(--accent)", fillOpacity: 0.08 }} />
      <rect x="900" y="40" width="80" height="520" style={{ fill: "var(--accent)", fillOpacity: 0.08 }} />
    </>
  ),
  soccer: (
    <>
      <rect x="20" y="20" width="960" height="560" />
      <line x1="500" y1="20" x2="500" y2="580" />
      <circle cx="500" cy="300" r="90" />
      <rect x="20" y="150" width="150" height="300" />
      <rect x="20" y="230" width="55" height="140" />
      <rect x="830" y="150" width="150" height="300" />
      <rect x="925" y="230" width="55" height="140" />
      <path d="M170 240 A 70 70 0 0 1 170 360" />
      <path d="M830 240 A 70 70 0 0 0 830 360" />
    </>
  ),
  mlb: (
    <>
      <path d="M500 560 L260 320 L500 80 L740 320 Z" />
      <path d="M500 560 L60 120 M500 560 L940 120" />
      <path d="M60 120 A 640 640 0 0 1 940 120" />
      <path d="M330 380 A 240 240 0 0 1 670 380" />
      <circle cx="500" cy="330" r="34" />
      <rect x="488" y="548" width="24" height="24" />
    </>
  ),
  nhl: (
    <>
      <rect x="20" y="20" width="960" height="560" rx="150" />
      <line x1="500" y1="20" x2="500" y2="580" strokeDasharray="14 10" />
      <line x1="360" y1="20" x2="360" y2="580" />
      <line x1="640" y1="20" x2="640" y2="580" />
      <line x1="100" y1="20" x2="100" y2="580" />
      <line x1="900" y1="20" x2="900" y2="580" />
      <circle cx="500" cy="300" r="80" />
      <circle cx="220" cy="160" r="70" />
      <circle cx="220" cy="440" r="70" />
      <circle cx="780" cy="160" r="70" />
      <circle cx="780" cy="440" r="70" />
      <path d="M100 260 A 40 40 0 0 1 100 340" />
      <path d="M900 260 A 40 40 0 0 0 900 340" />
    </>
  ),
};

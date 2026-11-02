import { useId } from "react";
import type { SportId } from "@/lib/sports";

/**
 * Cinematic, hand-built SVG "hero objects" — one per sport. Base materials
 * are physically coloured (orange leather, white hide, black rubber) and the
 * rim light picks up the active theme accent via CSS custom properties.
 */
export function SportBall({ sport, className }: { sport: SportId; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const Comp = BALLS[sport];
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${uid}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="transparent" />
          <stop offset="96%" style={{ stopColor: "var(--accent)" }} stopOpacity="0.85" />
          <stop offset="100%" style={{ stopColor: "var(--accent-2)" }} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="22%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="62%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.78" />
        </radialGradient>
        <filter id={`${uid}-pebble`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id={`${uid}-clip`}>
          <circle cx="200" cy="200" r="170" />
        </clipPath>
      </defs>
      <Comp uid={uid} />
    </svg>
  );
}

type P = { uid: string };

function Lighting({ uid, r = 170 }: P & { r?: number }) {
  return (
    <>
      <circle cx="200" cy="200" r={r} fill={`url(#${uid}-shade)`} />
      <circle cx="200" cy="200" r={r + 6} fill={`url(#${uid}-rim)`} style={{ mixBlendMode: "screen" }} />
      <path
        d={`M ${200 - r * 0.86} ${200 + r * 0.2} A ${r} ${r} 0 0 0 ${200 + r * 0.25} ${200 + r * 0.97}`}
        fill="none"
        style={{ stroke: "var(--accent-2)" }}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </>
  );
}

function Basketball({ uid, euro = false }: P & { euro?: boolean }) {
  const seam = { fill: "none", stroke: "#1b0b05", strokeWidth: 7, strokeLinecap: "round" as const };
  return (
    <g>
      <circle cx="200" cy="200" r="170" fill={euro ? "#e06a2c" : "#e8661d"} />
      <rect x="30" y="30" width="340" height="340" filter={`url(#${uid}-pebble)`} clipPath={`url(#${uid}-clip)`} opacity="0.5" />
      <g clipPath={`url(#${uid}-clip)`}>
        {euro ? (
          <>
            {/* 12-panel style: curved meridians */}
            <path d="M200 30 C 120 120, 120 280, 200 370" {...seam} />
            <path d="M200 30 C 280 120, 280 280, 200 370" {...seam} />
            <path d="M30 200 C 120 160, 280 160, 370 200" {...seam} />
            <path d="M60 110 C 150 150, 250 150, 340 110" {...seam} />
            <path d="M60 290 C 150 250, 250 250, 340 290" {...seam} />
          </>
        ) : (
          <>
            <path d="M200 30 L200 370" {...seam} />
            <path d="M30 200 L370 200" {...seam} />
            <path d="M88 70 C 150 140, 150 260, 88 330" {...seam} />
            <path d="M312 70 C 250 140, 250 260, 312 330" {...seam} />
          </>
        )}
      </g>
      <Lighting uid={uid} />
    </g>
  );
}

function Football({ uid }: P) {
  return (
    <g transform="rotate(-32 200 200)">
      <defs>
        <radialGradient id={`${uid}-fb`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#b5602f" />
          <stop offset="50%" stopColor="#7a3412" />
          <stop offset="100%" stopColor="#2a0f04" />
        </radialGradient>
        <clipPath id={`${uid}-fbclip`}>
          <ellipse cx="200" cy="200" rx="185" ry="112" />
        </clipPath>
      </defs>
      <ellipse cx="200" cy="200" rx="185" ry="112" fill={`url(#${uid}-fb)`} />
      <rect x="10" y="80" width="380" height="240" filter={`url(#${uid}-pebble)`} clipPath={`url(#${uid}-fbclip)`} opacity="0.45" />
      <path d="M40 200 C 120 170, 280 170, 360 200" fill="none" stroke="#2a0f04" strokeWidth="3" opacity="0.6" />
      {/* laces */}
      <path d="M140 168 L260 168" stroke="#f6efe6" strokeWidth="7" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M${152 + i * 16} 154 L${152 + i * 16} 182`} stroke="#f6efe6" strokeWidth="6" strokeLinecap="round" />
      ))}
      <ellipse cx="200" cy="200" rx="185" ry="112" fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="4" opacity="0.65" />
      <ellipse cx="160" cy="150" rx="90" ry="26" fill="#fff" opacity="0.12" />
      <ellipse cx="230" cy="250" rx="160" ry="60" fill="#000" opacity="0.3" clipPath={`url(#${uid}-fbclip)`} />
    </g>
  );
}

function pentagon(cx: number, cy: number, r: number, rot = -90) {
  return Array.from({ length: 5 }, (_, i) => {
    const a = ((rot + i * 72) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

function SoccerBall({ uid }: P) {
  const center = pentagon(200, 200, 54);
  const outers = Array.from({ length: 5 }, (_, i) => {
    const a = ((-90 + 36 + i * 72) * Math.PI) / 180;
    return pentagon(200 + 150 * Math.cos(a), 200 + 150 * Math.sin(a), 52, -90 + 36 + i * 72 + 180);
  });
  const pts = (p: readonly (readonly [number, number])[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <g>
      <circle cx="200" cy="200" r="170" fill="#f1f1ec" />
      <g clipPath={`url(#${uid}-clip)`}>
        <polygon points={pts(center)} fill="#161616" />
        {outers.map((o, i) => (
          <polygon key={i} points={pts(o)} fill="#161616" />
        ))}
        {center.map(([x, y], i) => {
          const a = ((-90 + i * 72) * Math.PI) / 180;
          return (
            <line key={i} x1={x} y1={y} x2={200 + 104 * Math.cos(a)} y2={200 + 104 * Math.sin(a)} stroke="#2b2b2b" strokeWidth="3" />
          );
        })}
        {Array.from({ length: 5 }, (_, i) => {
          const a = ((-90 + i * 72) * Math.PI) / 180;
          const x = 200 + 104 * Math.cos(a);
          const y = 200 + 104 * Math.sin(a);
          const l = ((-90 + i * 72 - 36) * Math.PI) / 180;
          const r = ((-90 + i * 72 + 36) * Math.PI) / 180;
          return (
            <g key={`h${i}`} stroke="#2b2b2b" strokeWidth="3">
              <line x1={x} y1={y} x2={200 + 128 * Math.cos(l)} y2={200 + 128 * Math.sin(l)} />
              <line x1={x} y1={y} x2={200 + 128 * Math.cos(r)} y2={200 + 128 * Math.sin(r)} />
              <line x1={x} y1={y} x2={200 + 175 * Math.cos(a)} y2={200 + 175 * Math.sin(a)} />
            </g>
          );
        })}
      </g>
      <Lighting uid={uid} />
    </g>
  );
}

function Baseball({ uid }: P) {
  const left = "M120 48 C 190 130, 190 270, 120 352";
  const right = "M280 48 C 210 130, 210 270, 280 352";
  return (
    <g>
      <circle cx="200" cy="200" r="170" fill="#f4efe6" />
      <rect x="30" y="30" width="340" height="340" filter={`url(#${uid}-pebble)`} clipPath={`url(#${uid}-clip)`} opacity="0.18" />
      <g clipPath={`url(#${uid}-clip)`} fill="none">
        {[left, right].map((d) => (
          <g key={d}>
            <path d={d} stroke="#c3122f" strokeWidth="3" />
            <path d={d} stroke="#c3122f" strokeWidth="16" strokeDasharray="3 11" opacity="0.95" />
          </g>
        ))}
      </g>
      <Lighting uid={uid} />
    </g>
  );
}

function Puck({ uid }: P) {
  return (
    <g transform="translate(0 10)">
      <defs>
        <linearGradient id={`${uid}-side`} x1="0" x2="1">
          <stop offset="0%" stopColor="#050607" />
          <stop offset="40%" stopColor="#1f2428" />
          <stop offset="100%" stopColor="#030303" />
        </linearGradient>
        <radialGradient id={`${uid}-top`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3a4248" />
          <stop offset="100%" stopColor="#0b0d0f" />
        </radialGradient>
      </defs>
      <path d="M40 200 L40 250 A160 62 0 0 0 360 250 L360 200 Z" fill={`url(#${uid}-side)`} />
      {Array.from({ length: 34 }, (_, i) => (
        <line key={i} x1={48 + i * 9.4} y1={212} x2={48 + i * 9.4} y2={240 + Math.sin((i / 33) * Math.PI) * 50} stroke="#000" strokeWidth="2" opacity="0.5" />
      ))}
      <ellipse cx="200" cy="200" rx="160" ry="62" fill={`url(#${uid}-top)`} />
      <ellipse cx="200" cy="200" rx="160" ry="62" fill="none" style={{ stroke: "var(--accent-2)" }} strokeWidth="3" opacity="0.85" />
      <ellipse cx="200" cy="200" rx="104" ry="38" fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="2" opacity="0.4" />
      <path d="M40 250 A160 62 0 0 0 360 250" fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="4" opacity="0.8" />
      <ellipse cx="150" cy="182" rx="70" ry="14" fill="#fff" opacity="0.1" />
    </g>
  );
}

const BALLS: Record<SportId, (p: P) => React.ReactElement> = {
  nba: (p) => <Basketball {...p} />,
  nfl: (p) => <Football {...p} />,
  soccer: (p) => <SoccerBall {...p} />,
  mlb: (p) => <Baseball {...p} />,
  nhl: (p) => <Puck {...p} />,
  euroleague: (p) => <Basketball {...p} euro />,
};

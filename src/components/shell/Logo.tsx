import { cn } from "@/lib/cn";

/** UniFantasy mark: a split "U" monogram whose inner arc carries the sport accent. */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={cn("logo-mark", className)} aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" rx="14" style={{ fill: "var(--accent)" }} />
      <path d="M13 11 V26 a11 11 0 0 0 22 0 V11" fill="none" style={{ stroke: "var(--accent-ink)" }} strokeWidth="6" strokeLinecap="round" />
      <path d="M24 11 V30" style={{ stroke: "var(--accent-ink)" }} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark", className)}>
      Uni<span className="text-accent">Fantasy</span>
    </span>
  );
}

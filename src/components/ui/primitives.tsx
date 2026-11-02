"use client";

import Link from "next/link";
import type { ComponentProps, CSSProperties, ElementType, ReactNode } from "react";
import { Info } from "lucide-react";
import { useReveal } from "@/lib/motion";
import { cn } from "@/lib/cn";

/* ---------- Reveal ---------- */

export function Reveal({
  as: Tag = "div",
  delay = 0,
  variant,
  className,
  children,
  style,
  ...rest
}: {
  as?: ElementType;
  delay?: number;
  variant?: "left" | "scale";
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
} & Record<string, unknown>) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={cn("reveal", variant && `reveal--${variant}`, className)}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ---------- Buttons ---------- */

type BtnVariant = "primary" | "ghost" | "glass";

export function ButtonLink({
  variant = "primary",
  className,
  children,
  icon,
  ...props
}: ComponentProps<typeof Link> & { variant?: BtnVariant; icon?: ReactNode }) {
  return (
    <Link className={cn("btn", `btn--${variant}`, className)} {...props}>
      <span>{children}</span>
      {icon && <span className="btn__icon">{icon}</span>}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  icon,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: BtnVariant; icon?: ReactNode }) {
  return (
    <button type={type} className={cn("btn", `btn--${variant}`, className)} {...props}>
      <span>{children}</span>
      {icon && <span className="btn__icon">{icon}</span>}
    </button>
  );
}

/* ---------- Chips / tags ---------- */

export function Chip({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "accent" | "muted"; className?: string }) {
  return <span className={cn("chip", `chip--${tone}`, className)}>{children}</span>;
}

/** Honest labelling for anything that is not real, live data. */
export function PreviewTag({ children = "Preview · No live data" }: { children?: ReactNode }) {
  return (
    <span className="preview-tag">
      <Info size={13} aria-hidden="true" />
      {children}
    </span>
  );
}

/* ---------- Section heading ---------- */

export function SectionHead({
  index,
  kicker,
  title,
  outline,
  lede,
  className,
  action,
}: {
  index?: string;
  kicker: string;
  title: string;
  outline?: string;
  lede?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal className={cn("section-head", className)}>
      {index && <span className="section-head__index display" aria-hidden="true">{index}</span>}
      <div className="section-head__body">
        <span className="kicker">{kicker}</span>
        <h2 className="display display-l">
          {title} {outline && <span className="text-outline">{outline}</span>}
        </h2>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {action && <div className="section-head__action">{action}</div>}
    </Reveal>
  );
}

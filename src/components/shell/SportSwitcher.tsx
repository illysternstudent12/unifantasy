"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, X } from "lucide-react";
import { useSelection } from "@/lib/preferences";
import { useSwitchUniverse } from "@/lib/use-switch";
import { SELECTIONS, metaFor, universeHref, type Selection } from "@/lib/universe";
import { SportBall } from "@/components/art/SportBall";
import { cn } from "@/lib/cn";

export function originOf(e: MouseEvent<HTMLElement>) {
  // keyboard activation reports 0,0 — fall back to the element centre
  if (e.clientX === 0 && e.clientY === 0) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: e.clientX, y: e.clientY };
}

/** Icon for a selection: the sport's ball, or a prism dot for "All Sports". */
export function UniverseGlyph({ sel }: { sel: Selection }) {
  return sel === "all" ? <span className="prism-dot" aria-hidden="true" /> : <SportBall sport={sel} />;
}

/** Desktop: inline segmented control — All Sports + six universes. */
export function SportSwitcherInline({ className }: { className?: string }) {
  const selection = useSelection();
  const switchTo = useSwitchUniverse();
  return (
    <div className={cn("sport-switch", className)} role="radiogroup" aria-label="Active universe">
      {SELECTIONS.map((id) => {
        const m = metaFor(id);
        const active = id === selection;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={active}
            data-sport={id}
            className={cn("sport-switch__btn", active && "is-active", id === "all" && "sport-switch__btn--all")}
            onClick={(e) => switchTo(id, originOf(e))}
            title={`${m.league} — ${m.themeName}`}
          >
            <span className="sport-switch__dot" aria-hidden="true" />
            {m.short}
          </button>
        );
      })}
    </div>
  );
}

/** Mobile: a compact trigger that opens a full sheet of themed universe tiles. */
export function SportSwitcherSheet() {
  const selection = useSelection();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const m = metaFor(selection);

  return (
    <>
      <button
        ref={triggerRef}
        className="sport-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Change universe. Current: ${m.league}`}
      >
        <span className="sport-trigger__ball">
          <UniverseGlyph sel={selection} />
        </span>
        <span className="sport-trigger__label">{m.short}</span>
      </button>
      {open && (
        <SportSheet
          current={selection}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function SportSheet({ current, onClose }: { current: Selection; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const switchTo = useSwitchUniverse();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLButtonElement>("[aria-checked='true']")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Choose a universe">
      <button className="sheet__scrim" aria-label="Close" onClick={onClose} tabIndex={-1} />
      <div className="sheet__panel" ref={panelRef}>
        <div className="sheet__head">
          <span className="kicker">Choose your universe</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close universe picker">
            <X size={20} />
          </button>
        </div>
        <div className="sport-tiles" role="radiogroup" aria-label="Universes">
          {SELECTIONS.map((id) => {
            const m = metaFor(id);
            const active = id === current;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={active}
                data-sport={id}
                className={cn("sport-tile", active && "is-active", id === "all" && "sport-tile--all")}
                onClick={(e) => {
                  switchTo(id, originOf(e));
                  onClose();
                }}
              >
                <span className="sport-tile__ball" aria-hidden="true">
                  <UniverseGlyph sel={id} />
                </span>
                <span className="sport-tile__name display">{m.league}</span>
                <span className="sport-tile__theme">{m.themeName}</span>
                {active && (
                  <span className="sport-tile__check" aria-hidden="true">
                    <Check size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <Link href={universeHref(current)} className="btn btn--primary sheet__cta" onClick={onClose}>
          <span>Enter the {metaFor(current).league} universe</span>
          <span className="btn__icon">
            <ArrowRight size={18} />
          </span>
        </Link>
      </div>
    </div>,
    document.body,
  );
}

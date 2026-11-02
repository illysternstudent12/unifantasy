"use client";

import { SPORT_LIST, type SportId } from "@/lib/sports";
import { SportBall } from "@/components/art/SportBall";
import { cn } from "@/lib/cn";

/**
 * In-page sport chooser for the "All Sports" universe, used by tools that
 * need one concrete sport (scoring, positions). Each chip carries its own
 * sport theme.
 */
export function SportPicker({ value, onChange, label }: { value: SportId; onChange: (id: SportId) => void; label: string }) {
  return (
    <div className="sport-picker" role="radiogroup" aria-label={label}>
      <span className="kicker sport-picker__label">{label}</span>
      <div className="sport-picker__row">
        {SPORT_LIST.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={s.id === value}
            data-sport={s.id}
            className={cn("sport-picker__chip", s.id === value && "is-active")}
            onClick={() => onChange(s.id)}
          >
            <span className="sport-picker__ball" aria-hidden="true">
              <SportBall sport={s.id} />
            </span>
            {s.league}
          </button>
        ))}
      </div>
    </div>
  );
}

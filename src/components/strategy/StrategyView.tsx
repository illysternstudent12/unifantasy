"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Button, Reveal, SectionHead } from "@/components/ui/primitives";
import { useUniverse } from "@/lib/preferences";
import { DEFAULT_SPORT, SPORTS, type Sport, type SportId } from "@/lib/sports";
import { TERMS } from "@/lib/universe";
import { SportPicker } from "@/components/ui/SportPicker";

const fmt = (n: number) => {
  const r = Math.round(n * 100) / 100;
  return (r === 0 ? 0 : r).toLocaleString("en-US", { maximumFractionDigits: 2 }); // avoid "-0"
};

export function StrategyView() {
  const { selection, sport: active } = useUniverse();
  const [picked, setPicked] = useState<SportId>(DEFAULT_SPORT);
  // "All Sports" gets an in-page picker; tools always model one concrete sport.
  const sport: Sport = active ?? SPORTS[picked];
  const sportId = sport.id;
  return (
    <>
      <PageHero
        kicker="Strategy Lab"
        title="Strategy"
        outline="Lab"
        lede="Deterministic tools for shaping your league: tune scoring, test a stat line, plan roster construction. Pure arithmetic — no projections."
      />
      <div data-sport={selection === "all" ? sportId : undefined}>
        {selection === "all" && (
          <div className="container">
            <SportPicker value={sportId} onChange={setPicked} label="Model which sport?" />
          </div>
        )}
        {/* key resets every tool when the sport changes */}
        <ScoringLab key={`score-${sportId}`} sport={sport} />
        <RosterLab key={`roster-${sportId}`} sport={sport} />
      </div>
    </>
  );
}

/* ---------- Scoring builder + stat-line calculator ---------- */

function ScoringLab({ sport }: { sport: Sport }) {
  const initialPoints = useMemo(() => Object.fromEntries(sport.scoring.map((s) => [s.key, s.defaultPoints])), [sport]);
  const [points, setPoints] = useState<Record<string, number>>(initialPoints);
  const [line, setLine] = useState<Record<string, string>>({});

  const rows = sport.scoring.map((s) => {
    const raw = Number(line[s.key] || 0);
    const units = s.per ? raw / s.per : raw;
    return { stat: s, raw, contribution: units * points[s.key] };
  });
  const total = rows.reduce((a, r) => a + r.contribution, 0);
  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.contribution)));

  return (
    <section className="section section--tight">
      <div className="container">
        <SectionHead
          index="A"
          kicker="Scoring builder"
          title="Set the"
          outline="rules"
          lede={`Start from common ${sport.league} defaults, then drag to match your league. Type any stat line to see what it scores.`}
          action={
            <Button
              variant="ghost"
              icon={<RotateCcw size={16} />}
              onClick={() => {
                setPoints(initialPoints);
                setLine({});
              }}
            >
              Reset
            </Button>
          }
        />

        <div className="lab">
          <Reveal className="panel lab__controls">
            <h3 className="panel__title">Points per stat</h3>
            <div className="lab__sliders">
              {sport.scoring.map((s) => {
                const v = points[s.key];
                const fill = ((v - s.min) / (s.max - s.min)) * 100;
                const id = `pts-${s.key}`;
                return (
                  <div key={s.key} className="slider-row">
                    <div className="slider-row__head">
                      <label htmlFor={id} className="field__label">
                        {s.label}
                        {s.per ? <span className="field__hint"> · per {s.per}</span> : null}
                      </label>
                      <output htmlFor={id} className="slider-row__value mono">
                        {v > 0 ? "+" : ""}
                        {fmt(v)}
                      </output>
                    </div>
                    <input
                      id={id}
                      type="range"
                      className="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={v}
                      style={{ "--fill": `${fill}%` } as CSSProperties}
                      onChange={(e) => setPoints((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
                    />
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="panel panel--hot lab__result" delay={100}>
            <span className="kicker">Your stat line</span>
            <p className="panel__text">Enter a hypothetical line — numbers you type, not a projection.</p>
            <div className="statline">
              {rows.map(({ stat, contribution }) => {
                const id = `line-${stat.key}`;
                return (
                  <div key={stat.key} className="statline__row">
                    <label htmlFor={id}>{stat.label}</label>
                    <input
                      id={id}
                      inputMode="decimal"
                      className="statline__input mono"
                      placeholder="0"
                      value={line[stat.key] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, "");
                        setLine((l) => ({ ...l, [stat.key]: v }));
                      }}
                    />
                    <span className="statline__bar" aria-hidden="true">
                      <span
                        className={contribution < 0 ? "is-neg" : undefined}
                        style={{ width: `${(Math.abs(contribution) / maxAbs) * 100}%` }}
                      />
                    </span>
                    <span className="statline__pts mono">{fmt(contribution)}</span>
                  </div>
                );
              })}
            </div>
            <div className="lab__total" aria-live="polite">
              <span className="kicker">Fantasy points</span>
              <span className="display lab__total-num">{fmt(total)}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Roster construction ---------- */

function RosterLab({ sport }: { sport: Sport }) {
  const initial = useMemo(() => Object.fromEntries(sport.roster.map((r) => [r.key, r.defaultCount])), [sport]);
  const [counts, setCounts] = useState<Record<string, number>>(initial);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          index="B"
          kicker={`${TERMS[sport.id].roster} construction`}
          title="Build the"
          outline="frame"
          lede={`Shape your league's ${TERMS[sport.id].lineup.toLowerCase()} slots and see the full ${TERMS[sport.id].roster.toLowerCase()} take form.`}
          action={
            <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={() => setCounts(initial)}>
              Reset
            </Button>
          }
        />
        <div className="roster">
          <Reveal className="panel roster__controls">
            {sport.roster.map((r) => {
              const c = counts[r.key];
              return (
                <div key={r.key} className="stepper">
                  <span className="stepper__label">{r.label}</span>
                  <div className="stepper__ctrl">
                    <button
                      className="icon-btn"
                      aria-label={`Remove a ${r.label} slot`}
                      disabled={c <= 0}
                      onClick={() => setCounts((s) => ({ ...s, [r.key]: Math.max(0, c - 1) }))}
                    >
                      <Minus size={18} />
                    </button>
                    <output className="stepper__value display" aria-live="polite" aria-label={`${r.label} slots`}>
                      {c}
                    </output>
                    <button
                      className="icon-btn"
                      aria-label={`Add a ${r.label} slot`}
                      disabled={c >= r.max}
                      onClick={() => setCounts((s) => ({ ...s, [r.key]: Math.min(r.max, c + 1) }))}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </Reveal>
          <Reveal className="panel roster__board" delay={100}>
            <div className="roster__head">
              <span className="kicker">{TERMS[sport.id].roster} size</span>
              <span className="display roster__total">{total}</span>
            </div>
            <div className="slots">
              {sport.roster.flatMap((r) =>
                Array.from({ length: counts[r.key] }, (_, i) => (
                  <span key={`${r.key}-${i}`} className={`slot ${r.key === "bn" ? "slot--bench" : ""}`}>
                    {r.label}
                  </span>
                )),
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

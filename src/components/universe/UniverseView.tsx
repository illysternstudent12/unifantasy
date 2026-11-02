"use client";

import Link from "next/link";
import { useEffect, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, FlaskConical, LayoutDashboard, Plug } from "lucide-react";
import { SportScene } from "@/components/art/SportScene";
import { ButtonLink, Chip, Reveal, SectionHead } from "@/components/ui/primitives";
import { UniverseGlyph } from "@/components/shell/SportSwitcher";
import { sportStore } from "@/lib/preferences";
import { useParallax, useTilt } from "@/lib/motion";
import { SPORTS, SPORT_IDS, SPORT_LIST, type SportId } from "@/lib/sports";
import { platformsFor } from "@/lib/platforms";
import {
  FORMAT,
  POSITION_NAMES,
  RULES,
  TERMS,
  TERM_LABELS,
  metaFor,
  universeHref,
  universeIndex,
  type Selection,
} from "@/lib/universe";
import { cn } from "@/lib/cn";

/**
 * A Sport Universe. The URL is the source of truth here: arriving on
 * /universe/nhl makes NHL the active universe app-wide (and persists it).
 */
export function UniverseView({ id }: { id: Selection }) {
  useEffect(() => {
    if (sportStore.get() !== id) {
      document.documentElement.dataset.sport = id;
      sportStore.set(id);
    }
  }, [id]);

  return (
    // scoped immediately, so content is themed even before the global sync
    <div data-sport={id} className="universe">
      <UniverseHero id={id} />
      {id === "all" ? <AllUniverses /> : <SportUniverse id={id} />}
    </div>
  );
}

/* ---------- Hero ---------- */

function UniverseHero({ id }: { id: Selection }) {
  const m = metaFor(id);
  const ghostRef = useParallax<HTMLSpanElement>(0.22);
  const chipsRef = useParallax<HTMLDivElement>(-0.1);
  const rules = id === "all" ? [] : RULES[id];
  const index = id === "all" ? null : universeIndex(id) + 1;

  return (
    <section className="uhero" aria-labelledby="uhero-title">
      <SportScene sport={id} variant="universe" backdrop depth={0.14} />
      <span ref={ghostRef} className="uhero__ghost display parallax" aria-hidden="true">
        {id === "all" ? "UNI" : m.short}
      </span>
      <div className="container uhero__inner">
        <div className="uhero__copy">
          <span className="kicker uhero__kicker">
            {index ? `Universe ${String(index).padStart(2, "0")} / 06` : "The multiverse"} · {m.themeName}
          </span>
          <h1 id="uhero-title" className="display uhero__title">
            <span className="hero__line hero__line--1 text-outline">{m.headline[0]}</span>
            <span className="hero__line hero__line--2 text-gradient">{m.headline[1]}</span>
          </h1>
          <p className="lede uhero__lede">{m.atmosphere}</p>
          <div className="btn-row uhero__ctas">
            <ButtonLink href="/" icon={<LayoutDashboard size={18} />}>
              {id === "all" ? "Dashboard" : `${m.short} dashboard`}
            </ButtonLink>
            <ButtonLink href="/strategy" variant="ghost" icon={<FlaskConical size={18} />}>
              Strategy Lab
            </ButtonLink>
          </div>
        </div>
        {rules.length > 0 && (
          <div ref={chipsRef} className="uhero__chips parallax" aria-label="Rules of the game">
            {rules.slice(0, 3).map((r, i) => (
              <div key={r.label} className={`float-stat uhero__chip uhero__chip--${i}`}>
                <span className="float-stat__label">Rulebook</span>
                <span className="float-stat__value">{r.value}</span>
                <span className="float-stat__note">{r.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Single sport universe ---------- */

function SportUniverse({ id }: { id: SportId }) {
  const sport = SPORTS[id];
  const terms = TERMS[id];
  const names = POSITION_NAMES[id];
  const platforms = platformsFor(id);
  const i = universeIndex(id);
  const prev = SPORT_IDS[(i + SPORT_IDS.length - 1) % SPORT_IDS.length];
  const next = SPORT_IDS[(i + 1) % SPORT_IDS.length];

  return (
    <>
      <section className="section" aria-labelledby="rules-title">
        <div className="container">
          <SectionHead
            index="01"
            kicker="Rules of the game"
            title="The shape"
            outline="of play"
            lede="Format facts from the rulebook — the frame every fantasy decision sits inside. Not live statistics."
          />
          <div className="rules">
            {RULES[id].map((r, k) => (
              <RuleCard key={r.label} value={r.value} label={r.label} depth={[0.04, -0.03, 0.07, -0.05][k]} index={k} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="lang-title">
        <div className="container lang">
          <SectionHead index="02" kicker="The language" title="Speak" outline={sport.short} />
          <Reveal className="panel lang__terms">
            <p className="panel__text">Switch to {sport.league} and UniFantasy speaks its language across every screen:</p>
            <dl className="terms">
              {TERM_LABELS.map((t) => (
                <div key={t.key} className="terms__row">
                  <dt>{t.label}</dt>
                  <dd className="display">{terms[t.key]}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal className="panel panel--hot lang__positions" delay={100}>
            <span className="kicker">Positions</span>
            <ul className="positions">
              {sport.positions.map((p) => (
                <li key={p}>
                  <span className="display">{p}</span>
                  <small>{names[p]}</small>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="score-title">
        <div className="container">
          <SectionHead
            index="03"
            kicker="Fantasy here"
            title="How it"
            outline="scores"
            lede="Common starting values in the Strategy Lab — every league tunes its own."
            action={
              <ButtonLink href="/strategy" variant="ghost" icon={<FlaskConical size={18} />}>
                Tune them
              </ButtonLink>
            }
          />
          <div className="scoring-chips">
            {sport.scoring.map((s, k) => (
              <Reveal key={s.key} className="scoring-chip" delay={k * 50}>
                <span className="scoring-chip__pts display">
                  {s.defaultPoints > 0 ? "+" : ""}
                  {s.defaultPoints}
                </span>
                <span>
                  {s.label}
                  {s.per ? ` · per ${s.per}` : ""}
                </span>
              </Reveal>
            ))}
          </div>
          <Reveal className="panel uplatforms" delay={120}>
            <Plug size={22} aria-hidden="true" />
            <p className="panel__text">
              <strong>{platforms.length} planned {sport.league} platforms</strong> — {platforms.map((p) => p.name).join(", ")}.
              None are connected yet.
            </p>
            <Link href="/connections" className="board__link">
              Connections <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-label="Other universes">
        <div className="container unext">
          <UniversePortalCard id={prev} direction="prev" />
          <UniversePortalCard id={next} direction="next" />
        </div>
      </section>
    </>
  );
}

function RuleCard({ value, label, depth, index }: { value: string; label: string; depth: number; index: number }) {
  const ref = useParallax<HTMLDivElement>(depth);
  return (
    <Reveal className={`rule rule--${index}`} delay={index * 80}>
      <div ref={ref} className="rule__inner panel parallax">
        <span className="rule__value display">{value}</span>
        <span className="rule__label">{label}</span>
      </div>
    </Reveal>
  );
}

function UniversePortalCard({ id, direction }: { id: Selection; direction?: "prev" | "next" }) {
  const m = metaFor(id);
  const tiltRef = useTilt<HTMLAnchorElement>(6);
  return (
    <Link
      ref={tiltRef}
      href={universeHref(id)}
      transitionTypes={["universe"]}
      data-sport={id}
      className={cn("uportal tilt", direction && `uportal--${direction}`)}
    >
      <span className="poster__bg" aria-hidden="true" />
      <SportScene sport={id} variant="poster" depth={0.03} lazy />
      <span className="portal__shine" aria-hidden="true" />
      <span className="uportal__body">
        <span className="uportal__dir mono">
          {direction === "prev" ? (
            <>
              <ArrowLeft size={14} aria-hidden="true" /> Previous universe
            </>
          ) : direction === "next" ? (
            <>
              Next universe <ArrowRight size={14} aria-hidden="true" />
            </>
          ) : (
            m.themeName
          )}
        </span>
        <span className="uportal__name display">{m.league}</span>
        <span className="poster__line">{m.atmosphere}</span>
      </span>
    </Link>
  );
}

/* ---------- All Sports universe ---------- */

function AllUniverses() {
  return (
    <>
      <section className="section" aria-label="Six universes">
        <div className="container">
          <SectionHead
            index="06"
            kicker="Six universes"
            title="Choose your"
            outline="world"
            lede="Each universe re-themes the whole app — colour, light, atmosphere and language."
          />
          <div className="uportals">
            {SPORT_LIST.map((s, k) => (
              <Reveal key={s.id} delay={k * 60} variant="scale">
                <UniversePortalCard id={s.id} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="compare-title">
        <div className="container">
          <SectionHead index="VS" kicker="Side by side" title="Six" outline="rulebooks" lede="Format facts, compared. Not statistics." />
          <Reveal className="panel compare">
            <table className="compare__table">
              <caption className="sr-only">Game format by sport</caption>
              <thead>
                <tr>
                  <th scope="col">Universe</th>
                  <th scope="col">Game length</th>
                  <th scope="col">On the field</th>
                  <th scope="col">Played in</th>
                </tr>
              </thead>
              <tbody>
                {SPORT_LIST.map((s) => (
                  <tr key={s.id} data-sport={s.id}>
                    <th scope="row">
                      <span className="compare__sport">
                        <span className="compare__ball" aria-hidden="true">
                          <UniverseGlyph sel={s.id} />
                        </span>
                        {s.league}
                      </span>
                    </th>
                    <td data-label="Game length">{FORMAT[s.id].length}</td>
                    <td data-label="On the field">{FORMAT[s.id].onField} per side</td>
                    <td data-label="Played in">{FORMAT[s.id].periods}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="dict-title">
        <div className="container">
          <SectionHead index="ABC" kicker="One app, six dialects" title="The" outline="dictionary" />
          <div className="dict">
            {SPORT_LIST.map((s, k) => (
              <Reveal key={s.id} data-sport={s.id} className="panel dict__card lift" delay={k * 50}>
                <span className="kicker">{s.league}</span>
                <dl className="dict__list">
                  {TERM_LABELS.map((t) => (
                    <div key={t.key}>
                      <dt>{t.label}</dt>
                      <dd>{TERMS[s.id][t.key]}</dd>
                    </div>
                  ))}
                </dl>
                <div className="dict__chips">
                  {s.positions.map((p) => (
                    <Chip key={p} tone="accent">
                      <abbr title={POSITION_NAMES[s.id][p]} style={{ textDecoration: "none" } as CSSProperties}>
                        {p}
                      </abbr>
                    </Chip>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

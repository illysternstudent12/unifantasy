"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, FlaskConical, Orbit, Plug, Radar } from "lucide-react";
import { SportScene } from "@/components/art/SportScene";
import { ButtonLink, PreviewTag, Reveal, SectionHead } from "@/components/ui/primitives";
import { useUniverse } from "@/lib/preferences";
import { SPORT_LIST } from "@/lib/sports";
import { PLATFORMS, platformsFor } from "@/lib/platforms";
import { useParallax, useTilt } from "@/lib/motion";
import { useSwitchUniverse } from "@/lib/use-switch";
import { SELECTIONS, metaFor, universeHref } from "@/lib/universe";
import type { Sport } from "@/lib/sports";
import { UniverseGlyph } from "@/components/shell/SportSwitcher";
import { cn } from "@/lib/cn";

export function HomeView() {
  const { sport, meta } = useUniverse();
  const t = meta.terms;
  const words = sport
    ? [...sport.positions, meta.league, meta.themeName, t.moves, `${t.lineup}s`, `${t.matchup}s`, "Trades"]
    : [...SPORT_LIST.map((s) => s.league), meta.themeName, "Lineups", "Matchups", "Trades"];

  return (
    <>
      <Hero />
      <Marquee words={words} />
      <SeasonBoard />
      <UniversePortal />
      <SportRail />
      <Features />
      <section className="section closing">
        <div className="container">
          <Reveal className="closing__inner panel panel--hot">
            <span className="kicker">Experience preview</span>
            <h2 className="display display-xl">
              Every sport.
              <br />
              One command centre.
            </h2>
            <p className="panel__text closing__text">
              This build is the visual and navigational foundation. Accounts, platform syncing, live data and the AI engine
              arrive later — nothing on this page is pretending to be live.
            </p>
            <div className="btn-row">
              <ButtonLink href="/connections" variant="glass" icon={<ArrowRight size={18} />} className="closing__btn">
                See planned connections
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  const { selection, sport, meta } = useUniverse();
  const switchTo = useSwitchUniverse();
  const chipsRef = useParallax<HTMLDivElement>(-0.06);
  const available = sport ? platformsFor(sport.id).length : PLATFORMS.length;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <SportScene key={selection} sport={selection} variant="hero" depth={0.1} backdrop />
      <div className="container hero__inner">
        <div className="hero__copy" key={selection}>
          <span className="kicker hero__kicker">
            {meta.league} · {meta.themeName}
          </span>
          <h1 id="hero-title" className="display display-xxl hero__title">
            <span className="hero__line hero__line--1 text-outline">{meta.headline[0]}</span>
            <span className="hero__line hero__line--2 text-gradient">{meta.headline[1]}</span>
          </h1>
          <p className="lede hero__lede">{meta.tagline}</p>
          <div className="btn-row hero__ctas">
            <ButtonLink href={universeHref(selection)} icon={<Orbit size={18} />}>
              {selection === "all" ? "Explore the universes" : `Enter the ${meta.short} universe`}
            </ButtonLink>
            <ButtonLink href="/copilot" variant="ghost">
              Meet your Copilot
            </ButtonLink>
          </div>
        </div>

        <div ref={chipsRef} className="hero__chips parallax" aria-label="Your account status">
          <div className="float-stat hero__chip hero__chip--a">
            <span className="float-stat__label">Leagues linked</span>
            <span className="float-stat__value">0</span>
            <span className="float-stat__note">Connect to begin</span>
          </div>
          <div className="float-stat hero__chip hero__chip--b">
            <span className="float-stat__label">{meta.short} platforms planned</span>
            <span className="float-stat__value">{available}</span>
            <span className="float-stat__note">{sport ? `of ${PLATFORMS.length} total` : "across six sports"}</span>
          </div>
          <div className="float-stat hero__chip hero__chip--c">
            <span className="float-stat__label">AI Copilot</span>
            <span className="float-stat__value">Preview</span>
            <span className="float-stat__note">Engine in a later batch</span>
          </div>
        </div>
      </div>

      <div className="container hero__reel-wrap">
        <div className="hero__reel" role="radiogroup" aria-label="Switch universe">
          {SELECTIONS.map((id, i) => (
            <button
              key={id}
              role="radio"
              aria-checked={id === selection}
              data-sport={id}
              className={cn("hero__reel-item", id === selection && "is-active")}
              onClick={(e) => switchTo(id, { x: e.clientX || window.innerWidth / 2, y: e.clientY || window.innerHeight / 2 })}
            >
              <span className="hero__reel-num mono">{i === 0 ? "ALL" : String(i).padStart(2, "0")}</span>
              <span className="hero__reel-name">{metaFor(id).league}</span>
              <span className="hero__reel-bar" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee({ words }: { words: string[] }) {
  const items = [...words, ...words];
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee">
        <div className="marquee__track">
          {items.map((w, i) => (
            <span key={i} className="marquee__item">
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Season board ---------- */

function SeasonBoard() {
  const { meta } = useUniverse();
  const t = meta.terms;
  return (
    <section className="section" aria-labelledby="board-title">
      <div className="container">
        <SectionHead
          index="01"
          kicker="Season board"
          title="Your season,"
          outline="at a glance"
          lede={`${t.lineup}s, ${t.matchup.toLowerCase()}s and alerts for every ${meta.league} league you run — once your platforms are connected.`}
        />
        <div className="board">
          <Reveal className="board__a panel panel--hot lift">
            <span className="kicker">Get started</span>
            <h3 className="display display-m board__big">Connect your first league</h3>
            <p className="panel__text">
              Link a fantasy platform and UniFantasy will bring every {t.roster.toLowerCase()} into one place. Integrations are being built —
              preview the roadmap now.
            </p>
            <Link href="/connections" className="board__link">
              Platform connections <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <span className="panel__numeral" aria-hidden="true">00</span>
          </Reveal>

          <Reveal className="board__b panel lift" delay={80}>
            <div className="board__row">
              <span className="kicker">{t.lineup} status</span>
              <PreviewTag>Awaiting data</PreviewTag>
            </div>
            <Ring />
            <p className="panel__text">Nothing to check yet. Start/sit alerts appear here {meta.period} once leagues sync.</p>
          </Reveal>

          <Reveal className="board__c panel panel--glass lift" delay={140}>
            <span className="kicker">Copilot briefing</span>
            <h3 className="panel__title">Your daily briefing lives here.</h3>
            <p className="panel__text">Injury context, {t.moves.toLowerCase()} targets and {t.matchup.toLowerCase()} notes — written for your leagues by the AI Copilot when it launches.</p>
            <ButtonLink href="/copilot" variant="ghost" icon={<Bot size={18} />} className="board__btn">
              Preview Copilot
            </ButtonLink>
          </Reveal>

          <Reveal className="board__d panel lift" delay={200}>
            <span className="kicker">Strategy Lab</span>
            <h3 className="panel__title">Tune a scoring model in seconds.</h3>
            <p className="panel__text">Adjust {meta.league} point values and {t.roster.toLowerCase()} slots with live arithmetic — no predictions, just your rules.</p>
            <ButtonLink href="/strategy" variant="ghost" icon={<FlaskConical size={18} />} className="board__btn">
              Open the lab
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Ring() {
  return (
    <div className="ring" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          style={{ stroke: "var(--accent)" }}
          strokeWidth="10"
          strokeDasharray="6 10"
          strokeLinecap="round"
          className="ring__dash"
        />
      </svg>
      <span className="ring__label display">—</span>
    </div>
  );
}

/* ---------- Universe portal ---------- */

function UniversePortal() {
  const { selection, meta } = useUniverse();
  const tiltRef = useTilt<HTMLAnchorElement>(6);
  return (
    <section className="section section--tight" aria-label={`${meta.league} universe`}>
      <div className="container">
        <Reveal variant="scale">
          <Link ref={tiltRef} href={universeHref(selection)} className="portal tilt">
            <SportScene key={selection} sport={selection} variant="poster" depth={0.05} backdrop lazy />
            <span className="portal__shine" aria-hidden="true" />
            <span className="portal__body">
              <span className="kicker">{selection === "all" ? "Six universes" : "Universe"}</span>
              <span className="display display-xl portal__title">
                {selection === "all" ? (
                  <>
                    Explore <span className="text-outline">every</span> arena
                  </>
                ) : (
                  <>
                    Enter the <span className="text-outline">{meta.short}</span>
                  </>
                )}
              </span>
              <span className="lede">{meta.atmosphere}</span>
              <span className="portal__go">
                Step inside <ArrowRight size={20} aria-hidden="true" />
              </span>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Six-sport rail: each poster scopes its own theme ---------- */

function SportRail() {
  const { selection } = useUniverse();
  return (
    <section className="section rail-section" aria-labelledby="rail-title">
      <div className="container">
        <SectionHead
          index="02"
          kicker="Six sports · one identity"
          title="Pick your"
          outline="arena"
          lede="Every sport gets its own light, palette and atmosphere. Tap a poster to make it your theme, or step into its universe."
        />
      </div>
      <div className="rail" role="list">
        {SPORT_LIST.map((s, i) => (
          <Reveal key={s.id} delay={i * 70} variant="scale" className="rail__cell" role="listitem">
            <Poster sport={s} index={i} active={s.id === selection} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Poster({ sport: s, index, active }: { sport: Sport; index: number; active: boolean }) {
  const switchTo = useSwitchUniverse();
  const tiltRef = useTilt<HTMLDivElement>(7);
  return (
    <div ref={tiltRef} data-sport={s.id} className={cn("poster tilt", active && "is-active")}>
      <span className="poster__bg" aria-hidden="true" />
      <SportScene sport={s.id} variant="poster" depth={0.04} lazy />
      <span className="portal__shine" aria-hidden="true" />
      <button
        className="poster__hit"
        aria-pressed={active}
        aria-label={`Use the ${s.league} theme`}
        onClick={(e) => {
          switchTo(s.id, { x: e.clientX || window.innerWidth / 2, y: e.clientY || window.innerHeight / 2 });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      <span className="poster__num mono">{String(index + 1).padStart(2, "0")} / 06</span>
      <span className="poster__body">
        <span className="poster__theme">{s.themeName}</span>
        <span className="poster__name display">{s.league}</span>
        <span className="poster__line">{s.atmosphere}</span>
        <span className="poster__actions">
          <span className="poster__cta">{active ? "Current theme" : "Tap to switch"}</span>
          <Link href={universeHref(s.id)} className="poster__link">
            Universe <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </span>
      </span>
    </div>
  );
}

/* ---------- Feature editorial ---------- */

const FEATURES = [
  {
    href: "/players",
    icon: Radar,
    kicker: "Player Intelligence",
    title: ["Scout", "deeper"],
    text: "Profile layouts built for fast decisions: role, usage, trend lines and context in one cinematic view.",
  },
  {
    href: "/strategy",
    icon: FlaskConical,
    kicker: "Strategy Lab",
    title: ["Model", "your rules"],
    text: "Scoring and roster construction tools that recalculate instantly as you shape your league settings.",
  },
  {
    href: "/connections",
    icon: Plug,
    kicker: "Platform Connections",
    title: ["One hub", "every app"],
    text: "Bring leagues from the platforms you already use. Integrations are on the roadmap, not faked.",
  },
];

function Features() {
  const { selection } = useUniverse();
  return (
    <section className="section" aria-label="Platform features">
      <div className="container">
        <SectionHead index="03" kicker="Inside UniFantasy" title="Built for the" outline="obsessed" />
        <div className="features">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.href} className={cn("feature", i % 2 === 1 && "feature--flip")}>
                <Link href={f.href} className="feature__link">
                  <div className="feature__art panel">
                    <FeatureArt index={i} />
                    <span className="feature__ball" aria-hidden="true">
                      <UniverseGlyph sel={selection} />
                    </span>
                  </div>
                  <div className="feature__copy">
                    <span className="feature__icon">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <span className="kicker">{f.kicker}</span>
                    <h3 className="display display-l">
                      {f.title[0]} <span className="text-outline">{f.title[1]}</span>
                    </h3>
                    <p className="lede">{f.text}</p>
                    <span className="feature__go">
                      Explore <ArrowRight size={18} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Abstract, data-free illustrations (shapes only — no numbers). */
function FeatureArt({ index }: { index: number }) {
  if (index === 0) {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const r = [80, 62, 92, 54, 74, 66][i];
      return `${150 + r * Math.cos(a)},${150 + r * Math.sin(a)}`;
    }).join(" ");
    return (
      <svg viewBox="0 0 300 300" className="feature__svg" aria-hidden="true">
        {[100, 70, 40].map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: 6 }, (_, i) => {
              const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
              return `${150 + r * Math.cos(a)},${150 + r * Math.sin(a)}`;
            }).join(" ")}
            fill="none"
            stroke="rgb(255 255 255 / 0.18)"
          />
        ))}
        <polygon points={pts} style={{ fill: "var(--accent)", stroke: "var(--accent-2)" }} fillOpacity="0.35" strokeWidth="3" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 300 300" className="feature__svg" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x="40" y={50 + i * 44} width="220" height="10" rx="5" fill="rgb(255 255 255 / 0.12)" />
            <rect x="40" y={50 + i * 44} width={60 + ((i * 53) % 150)} height="10" rx="5" style={{ fill: "var(--accent)" }} />
            <circle cx={100 + ((i * 53) % 150)} cy={55 + i * 44} r="11" fill="#fff" style={{ stroke: "var(--accent)" }} strokeWidth="4" />
          </g>
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 300" className="feature__svg" aria-hidden="true">
      <circle cx="150" cy="150" r="34" style={{ fill: "var(--accent)" }} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 8;
        const x = 150 + 110 * Math.cos(a);
        const y = 150 + 110 * Math.sin(a);
        return (
          <g key={i}>
            <line x1="150" y1="150" x2={x} y2={y} style={{ stroke: "var(--accent-2)" }} strokeDasharray="4 6" strokeWidth="2" opacity="0.6" />
            <circle cx={x} cy={y} r="14" fill="rgb(255 255 255 / 0.1)" stroke="rgb(255 255 255 / 0.4)" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}


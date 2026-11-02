"use client";

import { useState, type FormEvent } from "react";
import { Activity, CalendarRange, HeartPulse, Search, Target } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Chip, PreviewTag, Reveal, SectionHead } from "@/components/ui/primitives";
import { SportBall } from "@/components/art/SportBall";
import { SportPicker } from "@/components/ui/SportPicker";
import { useUniverse } from "@/lib/preferences";
import { DEFAULT_SPORT, SPORTS, type Sport, type SportId } from "@/lib/sports";
import { POSITION_NAMES, TERMS } from "@/lib/universe";

const MODULES = [
  { icon: Activity, title: "Trend lines", text: "Rolling form across recent periods, with role changes marked on the timeline." },
  { icon: Target, title: "Usage & role", text: "How involved a player is — shares, touches, minutes or ice time, by sport." },
  { icon: CalendarRange, title: "Schedule context", text: "Upcoming opponents and fixture density laid out before you set a lineup." },
  { icon: HeartPulse, title: "Availability", text: "Status and return-timeline context, sourced and timestamped when data arrives." },
];

export function PlayersView() {
  const { selection, sport, meta } = useUniverse();
  const [picked, setPicked] = useState<SportId>(DEFAULT_SPORT);
  // In "All Sports" the page gets its own sport picker; otherwise it follows the universe.
  const focus: Sport = sport ?? SPORTS[picked];
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(query.trim());
  };

  return (
    <>
      <PageHero
        kicker="Player Intelligence"
        title="Scout"
        outline="Deeper"
        lede={`Cinematic player profiles for ${meta.league} — built to turn context into confident start, sit and trade decisions.`}
      >
        <form className="search" role="search" onSubmit={onSubmit}>
          <Search size={20} aria-hidden="true" className="search__icon" />
          <label htmlFor="player-search" className="sr-only">
            Search players
          </label>
          <input
            id="player-search"
            className="input search__input"
            placeholder={`Search ${meta.league} players`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn--primary search__btn">
            <span>Search</span>
          </button>
        </form>
        <div aria-live="polite" className="search__result">
          {submitted !== null && (
            <p>
              {submitted ? <>No results for “{submitted}”. </> : null}
              The player database connects in a later batch — search is wired up, but there is no data behind it yet.
            </p>
          )}
        </div>
      </PageHero>

      <section className="section section--tight" data-sport={selection === "all" ? focus.id : undefined}>
        <div className="container">
          {selection === "all" && <SportPicker value={focus.id} onChange={setPicked} label="Scout which sport?" />}
          {/* keyed so the position filter resets whenever the sport changes */}
          <ProfilePreview key={focus.id} sport={focus} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead index="INT" kicker="Profile modules" title="Context," outline="not clutter" />
          <div className="module-grid">
            {MODULES.map((m, i) => {
              const Icon = m.icon;
              return (
                <Reveal key={m.title} className="panel module lift" delay={i * 70}>
                  <span className="format__icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="panel__title">{m.title}</h3>
                  <p className="panel__text">{m.text}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function ProfilePreview({ sport }: { sport: Sport }) {
  const [pos, setPos] = useState<string | null>(null);
  const names = POSITION_NAMES[sport.id];
  const terms = TERMS[sport.id];
  return (
    <>
      <Reveal className="filter-bar">
        <div className="segmented" role="group" aria-label={`Filter ${sport.league} players by position`}>
          <button aria-pressed={pos === null} onClick={() => setPos(null)}>
            All
          </button>
          {sport.positions.map((p) => (
            <button key={p} aria-pressed={pos === p} onClick={() => setPos(p)} title={names[p]}>
              {p}
            </button>
          ))}
        </div>
        <span className="filter-bar__count mono" aria-live="polite">
          {pos ? names[pos] : `All ${sport.league} positions`}
        </span>
      </Reveal>

      <Reveal className="profile panel">
        <div className="profile__media">
          <span className="profile__ball" aria-hidden="true">
            <SportBall sport={sport.id} />
          </span>
          <span className="profile__pos display" aria-hidden="true">
            {pos ?? sport.positions[0]}
          </span>
        </div>
        <div className="profile__body">
          <div className="profile__top">
            <PreviewTag>Layout preview · No real player</PreviewTag>
            <Chip tone="accent">{pos ? names[pos] : "Any position"}</Chip>
          </div>
          <h2 className="display display-l profile__name">
            Player
            <br />
            <span className="text-outline">Profile</span>
          </h2>
          <p className="panel__text">
            This is the profile frame every {sport.league} player will use. Fields stay empty until a licensed data source is
            connected.
          </p>
          <dl className="profile__stats">
            {["Role", "Usage", "Form", `Next ${terms.matchup.toLowerCase()}`].map((k) => (
              <div key={k} className="profile__stat">
                <dt>{k}</dt>
                <dd className="display">—</dd>
              </div>
            ))}
          </dl>
          <div className="skeleton-spark" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </Reveal>
    </>
  );
}

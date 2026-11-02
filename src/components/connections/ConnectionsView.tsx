"use client";

import { useState } from "react";
import { Link2, Lock, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Chip, Reveal, SectionHead } from "@/components/ui/primitives";
import { useSelection } from "@/lib/preferences";
import { SPORT_LIST, SPORTS, type SportId } from "@/lib/sports";
import { PLATFORMS } from "@/lib/platforms";

const STEPS = [
  { title: "Choose a platform", text: "Pick where your league lives. Each platform has its own sign-in or league-ID flow." },
  { title: "Authorise access", text: "You'll approve read access on the platform's own page where possible — never by giving us a password." },
  { title: "Sync & explore", text: "Rosters, standings and matchups appear in My Leagues, themed by sport." },
];

export function ConnectionsView() {
  const current = useSelection();
  // null = follow the active sport (it isn't known until after hydration)
  const [picked, setFilter] = useState<SportId | "all" | null>(null);
  const filter = picked ?? current;
  const list = filter === "all" ? PLATFORMS : PLATFORMS.filter((p) => p.sports.includes(filter));

  return (
    <>
      <PageHero
        kicker="Platform Connections"
        title="Plug in"
        outline="Everything"
        lede="Bring every league from every platform into one hub. These integrations are planned — none are live in this build, and nothing here collects credentials."
      />

      <section className="section section--tight">
        <div className="container">
          <Reveal className="filter-bar">
            <div className="segmented" role="group" aria-label="Filter platforms by sport">
              <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
                All
              </button>
              {SPORT_LIST.map((s) => (
                <button key={s.id} aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}>
                  {s.short}
                </button>
              ))}
            </div>
            <span className="filter-bar__count mono" aria-live="polite">
              {list.length} planned · 0 connected
            </span>
          </Reveal>

          <div className="platform-grid">
            {list.map((p, i) => (
              <Reveal key={p.id} className="panel platform lift" delay={i * 50}>
                <div className="platform__top">
                  <span className="platform__mono display" aria-hidden="true">
                    {p.name.slice(0, 2)}
                  </span>
                  <Chip tone="muted">Planned</Chip>
                </div>
                <h3 className="panel__title">{p.name}</h3>
                <p className="platform__method">
                  <Link2 size={14} aria-hidden="true" /> {p.method}
                </p>
                <ul className="platform__sports" aria-label="Sports supported">
                  {p.sports.map((s) => (
                    <li key={s} data-sport={s}>
                      <span aria-hidden="true" />
                      {SPORTS[s].short}
                    </li>
                  ))}
                </ul>
                <button className="btn btn--ghost platform__btn" disabled aria-describedby="connect-note">
                  <Lock size={16} aria-hidden="true" />
                  <span>Coming soon</span>
                </button>
              </Reveal>
            ))}
          </div>
          <p id="connect-note" className="footnote">
            Connections are disabled in Batch 1. Platform names are listed for planning only; UniFantasy is not affiliated with them.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead index="SYNC" kicker="How it will work" title="Three steps," outline="zero friction" />
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} className="panel step" delay={i * 80}>
                <span className="step__num display">{i + 1}</span>
                <h3 className="panel__title">{s.title}</h3>
                <p className="panel__text">{s.text}</p>
              </Reveal>
            ))}
            <Reveal className="panel panel--hot step step--trust" delay={260}>
              <ShieldCheck size={28} aria-hidden="true" />
              <h3 className="panel__title">Read-only by design</h3>
              <p className="panel__text">The plan is read access only: UniFantasy will suggest, you decide, and your platform stays the source of truth.</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

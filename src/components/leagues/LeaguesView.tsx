"use client";

import { useState } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink, Chip, Reveal, SectionHead } from "@/components/ui/primitives";
import { UniverseGlyph } from "@/components/shell/SportSwitcher";
import { useUniverse } from "@/lib/preferences";
import { TERMS, ALL_TERMS } from "@/lib/universe";
import { SPORT_LIST, SPORTS, type SportId } from "@/lib/sports";
import { PLATFORMS } from "@/lib/platforms";

const FORMATS = [
  { name: "Head-to-head points", text: "Weekly matchups decided by total fantasy points under your league's scoring." },
  { name: "Head-to-head categories", text: "Win the week category by category — balance beats raw volume." },
  { name: "Rotisserie", text: "Season-long standings ranked across every category. Marathon, not sprint." },
  { name: "Best ball", text: "No lineup setting — your top performers count automatically each period." },
  { name: "Dynasty & keeper", text: "Multi-season rosters where rookies, picks and age curves matter." },
  { name: "Gameweek / daily", text: "Fresh squads each round or slate — captaincy and budget decisions every time." },
];

export function LeaguesView() {
  const { selection } = useUniverse();
  // null = follow the active universe (known only after hydration)
  const [picked, setFilter] = useState<SportId | "all" | null>(null);
  const filter = picked ?? selection;
  const t = filter === "all" ? ALL_TERMS : TERMS[filter];
  const shownSport = filter === "all" ? null : SPORTS[filter];
  const platforms = filter === "all" ? PLATFORMS : PLATFORMS.filter((p) => p.sports.includes(filter));

  return (
    <>
      <PageHero
        kicker="My Leagues"
        title="My"
        outline="Leagues"
        lede={`Every ${filter === "all" ? "" : SPORTS[filter].league + " "}league you play — gathered into one living season hub.`}
      />

      <section className="section section--tight">
        <div className="container">
          <Reveal className="filter-bar">
            <div className="segmented" role="group" aria-label="Filter leagues by sport">
              <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
                All sports
              </button>
              {SPORT_LIST.map((s) => (
                <button key={s.id} aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}>
                  {s.short}
                </button>
              ))}
            </div>
            <span className="filter-bar__count mono" aria-live="polite">
              0 leagues{shownSport ? ` · ${shownSport.league}` : ""}
            </span>
          </Reveal>

          <div className="leagues-empty">
            <Reveal className="panel panel--hot leagues-empty__main" data-sport={filter}>
              <span className="kicker">No leagues yet</span>
              <h2 className="display display-l">
                Your trophy
                <br />
                cabinet is empty
              </h2>
              <p className="panel__text">
                Once platform connections launch, your {shownSport ? shownSport.league : "fantasy"} leagues will appear here
                with standings, {t.matchup.toLowerCase()}s and {t.roster.toLowerCase()} health. Until then, there is nothing to show — and we won&apos;t invent it.
              </p>
              <div className="btn-row">
                <ButtonLink href="/connections" variant="glass" icon={<ArrowRight size={18} />}>
                  View planned platforms
                </ButtonLink>
              </div>
              <span className="leagues-empty__ball" aria-hidden="true">
                <UniverseGlyph sel={filter} />
              </span>
            </Reveal>

            <Reveal className="panel leagues-empty__side" delay={100}>
              <span className="kicker">Will sync from</span>
              <ul className="mini-list">
                {platforms.map((p) => (
                  <li key={p.id}>
                    <span>{p.name}</span>
                    <Chip tone="muted">Planned</Chip>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            index="FMT"
            kicker="Formats"
            title="Every way"
            outline="to play"
            lede="League views are being designed around the formats fantasy managers actually run."
          />
          <div className="format-grid">
            {FORMATS.map((f, i) => (
              <Reveal key={f.name} className="panel format lift" delay={i * 60}>
                <span className="format__icon">
                  <Layers size={20} aria-hidden="true" />
                </span>
                <h3 className="panel__title">{f.name}</h3>
                <p className="panel__text">{f.text}</p>
                <span className="panel__numeral" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

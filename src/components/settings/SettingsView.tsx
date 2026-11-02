"use client";

import type { ReactNode } from "react";
import { Check, RotateCcw } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Button, Reveal } from "@/components/ui/primitives";
import { UniverseGlyph } from "@/components/shell/SportSwitcher";
import { SELECTIONS, metaFor } from "@/lib/universe";
import {
  DEFAULT_PREFS,
  prefsStore,
  switchSport,
  updatePrefs,
  usePrefs,
  useReducedMotion,
  useSelection,
  type MotionPref,
} from "@/lib/preferences";
import { DEFAULT_SPORT, SPORT_LIST } from "@/lib/sports";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const MOTION: { id: MotionPref; label: string }[] = [
  { id: "system", label: "Match system" },
  { id: "reduced", label: "Reduced" },
  { id: "full", label: "Full motion" },
];

export function SettingsView() {
  const sport = useSelection();
  const prefs = usePrefs();
  const reduced = useReducedMotion();
  const { status, profile } = useAuth();

  const toggleFav = (id: (typeof SPORT_LIST)[number]["id"]) =>
    updatePrefs({
      favoriteSports: prefs.favoriteSports.includes(id)
        ? prefs.favoriteSports.filter((s) => s !== id)
        : [...prefs.favoriteSports, id],
    });

  return (
    <>
      <PageHero kicker="Settings" title="Make it" outline="Yours" lede="Display preferences for this device — theme, motion and layout. Profile and interests live in your Account." />

      <section className="section section--tight">
        <div className="container settings">
          <Group title="Universe" hint="Sets the sport, palette, atmosphere and terminology across the whole app — or choose All Sports.">
            <div className="theme-grid" role="radiogroup" aria-label="Universe">
              {SELECTIONS.map((id) => {
                const s = metaFor(id);
                const active = id === sport;
                return (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={active}
                    data-sport={id}
                    className={cn("sport-tile theme-tile", active && "is-active", id === "all" && "sport-tile--all")}
                    onClick={(e) => switchSport(id, { x: e.clientX || innerWidth / 2, y: e.clientY || innerHeight / 2 })}
                  >
                    <span className="sport-tile__ball" aria-hidden="true">
                      <UniverseGlyph sel={id} />
                    </span>
                    <span className="sport-tile__name display">{s.league}</span>
                    <span className="sport-tile__theme">{s.themeName}</span>
                    {active && (
                      <span className="sport-tile__check" aria-hidden="true">
                        <Check size={16} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Group>

          {status === "signed-in" ? (
            <Group title="Sports you follow" hint="Saved to your account — they order the sport switcher and personalise your dashboard.">
              <div className="fav-list">
                {SPORT_LIST.filter((s) => profile?.favorite_sports.includes(s.id)).map((s) => (
                  <span key={s.id} data-sport={s.id} className="fav is-on">
                    <span className="fav__dot" aria-hidden="true" />
                    {s.league}
                  </span>
                ))}
                {!profile?.favorite_sports.length && <span className="field__hint">None yet.</span>}
              </div>
              <Link href="/account" className="text-link">
                Edit in Account →
              </Link>
            </Group>
          ) : (
            <Group title="Sports you follow" hint="Saved on this device. Sign in to keep them with your account.">
              <div className="fav-list">
                {SPORT_LIST.map((s) => {
                  const on = prefs.favoriteSports.includes(s.id);
                  return (
                    <button key={s.id} data-sport={s.id} className={cn("fav", on && "is-on")} aria-pressed={on} onClick={() => toggleFav(s.id)}>
                      <span className="fav__dot" aria-hidden="true" />
                      {s.league}
                      {on && <Check size={16} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </Group>
          )}

          <Group title="Motion" hint={`Animations, transitions and parallax. Currently ${reduced ? "reduced" : "full"}.`}>
            <div className="segmented" role="radiogroup" aria-label="Motion preference">
              {MOTION.map((m) => (
                <button key={m.id} role="radio" aria-checked={prefs.motion === m.id} onClick={() => updatePrefs({ motion: m.id })}>
                  {m.label}
                </button>
              ))}
            </div>
            <Toggle label="Parallax depth" hint="Layers drift at different speeds as you scroll." checked={prefs.parallax} onChange={(v) => updatePrefs({ parallax: v })} />
          </Group>

          <Group title="Display">
            <Toggle label="Film grain" hint="A subtle cinematic texture over the whole interface." checked={prefs.grain} onChange={(v) => updatePrefs({ grain: v })} />
            <Toggle
              label="Collapsed sidebar"
              hint="Desktop navigation shows icons only."
              checked={prefs.sidebarCollapsed}
              onChange={(v) => updatePrefs({ sidebarCollapsed: v })}
            />
          </Group>

          <Group title="Reset">
            <div className="settings__reset">
              <p className="panel__text">Restore every preference and the default {SPORT_LIST[0].league} theme on this device.</p>
              <Button
                variant="ghost"
                icon={<RotateCcw size={16} />}
                onClick={() => {
                  prefsStore.set(DEFAULT_PREFS);
                  switchSport(DEFAULT_SPORT);
                }}
              >
                Reset preferences
              </Button>
            </div>
          </Group>

          <Reveal className="panel panel--glass about">
            <span className="kicker">About this build</span>
            <p className="panel__text">
              UniFantasy · Batch 3 — accounts and onboarding. No live sports data, platform integrations or prediction
              models are included yet.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Reveal as="section" className="panel settings__group" aria-label={title}>
      <div className="settings__group-head">
        <h2 className="display display-s">{title}</h2>
        {hint && <p className="field__hint">{hint}</p>}
      </div>
      <div className="settings__group-body">{children}</div>
    </Reveal>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="field__label">{label}</div>
        {hint && <div className="field__hint">{hint}</div>}
      </div>
      <button role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />
    </div>
  );
}

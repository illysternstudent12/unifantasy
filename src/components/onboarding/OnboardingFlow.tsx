"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Star } from "lucide-react";
import { SportScene } from "@/components/art/SportScene";
import { SportBall } from "@/components/art/SportBall";
import { UniverseGlyph } from "@/components/shell/SportSwitcher";
import { FormNotice } from "@/components/auth/FormParts";
import { useAuth } from "@/components/auth/AuthProvider";
import { completeOnboarding, saveOnboardingStep, type ProfilePatch } from "@/app/actions/profile";
import {
  LANGUAGES,
  NOTIFICATIONS,
  ONBOARDING_STEPS,
  formatsFor,
  isValidTimeZone,
  validateDisplayName,
  type Profile,
} from "@/lib/profile";
import { PLATFORMS } from "@/lib/platforms";
import { SPORTS, SPORT_LIST, type SportId } from "@/lib/sports";
import { metaFor, type Selection } from "@/lib/universe";
import { sportStore } from "@/lib/preferences";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/use-hydrated";

const LAST = ONBOARDING_STEPS.length - 1;

function timeZones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC"];
  }
}

export function OnboardingFlow({ initial }: { initial: Profile }) {
  const router = useRouter();
  const { setProfile } = useAuth();
  const [step, setStep] = useState(initial.onboarding_completed_at ? 0 : initial.onboarding_step);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Draft state, seeded from what's already saved.
  const [name, setName] = useState(initial.display_name ?? "");
  const [sports, setSports] = useState<SportId[]>(initial.favorite_sports);
  const [home, setHome] = useState<Selection>(initial.home_universe);
  const [platforms, setPlatforms] = useState<string[]>(initial.platforms);
  const [formats, setFormats] = useState<string[]>(initial.formats);
  const [tz, setTz] = useState(initial.time_zone === "UTC" ? "" : initial.time_zone);
  const [language, setLanguage] = useState<string>(initial.language);
  const [notifications, setNotifications] = useState(initial.notifications);
  const [focus, setFocus] = useState<Selection>(initial.favorite_sports[0] ?? "all");

  // Intl data differs between server and browser — only read it after hydration.
  const hydrated = useHydrated();
  const zones = useMemo(() => (hydrated ? timeZones() : []), [hydrated]);
  const detectedTz = useMemo(() => (hydrated ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"), [hydrated]);
  const effectiveTz = tz || (isValidTimeZone(detectedTz) ? detectedTz : "UTC");
  const zoneOptions = zones.includes(effectiveTz) ? zones : [effectiveTz, ...zones];

  // Move focus to the new step's heading (screen readers + keyboard users).
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  // Keep the home universe valid when sports change.
  const homeOptions: Selection[] = ["all", ...sports];
  const safeHome = homeOptions.includes(home) ? home : sports.length === 1 ? sports[0] : "all";

  const patchFor = (s: number): ProfilePatch => {
    switch (s) {
      case 0:
        return { display_name: name };
      case 1:
        return { favorite_sports: sports, home_universe: safeHome };
      case 2:
        return { platforms };
      case 3:
        return { formats: formats as ProfilePatch["formats"] };
      default:
        return { time_zone: effectiveTz, language: language as ProfilePatch["language"], notifications };
    }
  };

  const go = (to: number, save: boolean) => {
    setError(null);
    if (step === 0 && save) {
      const err = validateDisplayName(name);
      if (err) {
        setError(err);
        return;
      }
    }
    start(async () => {
      if (to > LAST) {
        const res = await completeOnboarding({ ...patchFor(0), ...patchFor(1), ...patchFor(2), ...patchFor(3), ...patchFor(4) });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setProfile(res.profile);
        document.documentElement.dataset.sport = res.profile.home_universe;
        sportStore.set(res.profile.home_universe);
        setDone(true);
        window.setTimeout(() => router.push("/?welcome=1"), 1400);
        return;
      }
      if (save || to > step) {
        const res = await saveOnboardingStep(save ? patchFor(step) : {}, to);
        if (!res.ok) {
          setError(res.error);
          return;
        }
      }
      setDir(to > step ? "fwd" : "back");
      setStep(to);
    });
  };

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const optional = step >= 1;
  const available = formatsFor(sports);

  if (done) {
    const m = metaFor(safeHome);
    return (
      <section className="onb onb--done" data-sport={safeHome} aria-live="polite">
        <SportScene sport={safeHome} variant="hero" backdrop />
        <div className="onb__done">
          <span className="onb__done-check" aria-hidden="true">
            <Check size={40} />
          </span>
          <h1 className="display display-xl">You&apos;re in, {name.trim() || "manager"}.</h1>
          <p className="lede">Opening your {m.league} universe…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="onb" data-sport={step === 1 ? focus : safeHome} aria-labelledby="onb-title">
      <SportScene key={step === 1 ? focus : safeHome} sport={step === 1 ? focus : safeHome} variant="hero" backdrop depth={0.05} className="onb__scene" />

      <div className="container onb__inner">
        {/* Progress */}
        <nav className="onb__progress" aria-label="Setup progress">
          <ol>
            {ONBOARDING_STEPS.map((label, i) => (
              <li key={label} className={cn(i < step && "is-done", i === step && "is-current")} aria-current={i === step ? "step" : undefined}>
                <span className="onb__dot" aria-hidden="true">
                  {i < step ? <Check size={12} /> : i + 1}
                </span>
                <span className="onb__label">{label}</span>
              </li>
            ))}
          </ol>
          <div className="onb__bar" aria-hidden="true">
            <span style={{ width: `${(step / LAST) * 100}%` }} />
          </div>
          <p className="sr-only" aria-live="polite">
            Step {step + 1} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[step]}
          </p>
        </nav>

        <div key={step} className={cn("onb__step", `onb__step--${dir}`)}>
          {step === 0 && (
            <StepHead headingRef={headingRef} kicker="Welcome to UniFantasy" title="Let's build" outline="your universe" lede="Five quick steps. Everything after this one is optional, and you can change it all later in Account.">
              <div className="field onb__name">
                <label htmlFor="onb-name" className="field__label">
                  What should we call you?
                </label>
                <input
                  id="onb-name"
                  className={cn("input input--xl", error && "input--error")}
                  value={name}
                  maxLength={40}
                  autoComplete="nickname"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && go(1, true)}
                  aria-invalid={error ? true : undefined}
                />
              </div>
            </StepHead>
          )}

          {step === 1 && (
            <StepHead headingRef={headingRef} kicker="Step 2 · Sports" title="Pick your" outline="sports" lede="Choose every sport you play. Your picks shape the dashboard and navigation — all six stay one tap away either way.">
              <div className="pick-grid pick-grid--sports" role="group" aria-label="Favourite sports">
                {SPORT_LIST.map((s) => {
                  const on = sports.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      data-sport={s.id}
                      aria-pressed={on}
                      className={cn("pick pick--sport", on && "is-on")}
                      onClick={() => {
                        setSports((l) => toggle(l, s.id));
                        setFocus(s.id);
                      }}
                      onMouseEnter={() => setFocus(s.id)}
                      onFocus={() => setFocus(s.id)}
                    >
                      <span className="pick__ball" aria-hidden="true">
                        <SportBall sport={s.id} />
                      </span>
                      <span className="pick__name display">{s.league}</span>
                      <span className="pick__meta">{s.themeName}</span>
                      <span className="pick__check" aria-hidden="true">
                        <Check size={16} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {sports.length > 0 && (
                <div className="onb__home">
                  <span className="field__label" id="home-label">
                    <Star size={14} aria-hidden="true" /> Home universe — where UniFantasy opens
                  </span>
                  <div className="segmented" role="radiogroup" aria-labelledby="home-label">
                    {homeOptions.map((h) => (
                      <button key={h} type="button" role="radio" aria-checked={safeHome === h} onClick={() => setHome(h)} data-sport={h}>
                        <span className="onb__home-glyph" aria-hidden="true">
                          <UniverseGlyph sel={h} />
                        </span>
                        {metaFor(h).league}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </StepHead>
          )}

          {step === 2 && (
            <StepHead headingRef={headingRef} kicker="Step 3 · Platforms" title="Where do" outline="you play?" lede="We'll prioritise these when connections launch. Nothing connects yet, and we never ask for platform passwords.">
              <div className="pick-grid" role="group" aria-label="Fantasy platforms">
                {[...PLATFORMS]
                  .sort((a, b) => Number(b.sports.some((s) => sports.includes(s))) - Number(a.sports.some((s) => sports.includes(s))))
                  .map((p) => {
                    const on = platforms.includes(p.id);
                    return (
                      <button key={p.id} type="button" aria-pressed={on} className={cn("pick pick--platform", on && "is-on")} onClick={() => setPlatforms((l) => toggle(l, p.id))}>
                        <span className="platform__mono display" aria-hidden="true">
                          {p.name.slice(0, 2)}
                        </span>
                        <span className="pick__name">{p.name}</span>
                        <span className="pick__sports">
                          {p.sports.map((s) => (
                            <span key={s} data-sport={s} className="pick__dot" title={SPORTS[s].league} />
                          ))}
                          <span className="sr-only">Supports {p.sports.map((s) => SPORTS[s].league).join(", ")}</span>
                        </span>
                        <span className="pick__check" aria-hidden="true">
                          <Check size={16} />
                        </span>
                      </button>
                    );
                  })}
              </div>
            </StepHead>
          )}

          {step === 3 && (
            <StepHead
              headingRef={headingRef}
              kicker="Step 4 · Formats"
              title="How do"
              outline="you play?"
              lede={sports.length ? `Formats that fit ${sports.map((s) => SPORTS[s].short).join(", ")}. Pick any you run.` : "Pick any formats you run."}
            >
              <div className="pick-grid pick-grid--formats" role="group" aria-label="Fantasy formats">
                {available.map((f) => {
                  const on = formats.includes(f.id);
                  return (
                    <button key={f.id} type="button" aria-pressed={on} className={cn("pick pick--format", on && "is-on")} onClick={() => setFormats((l) => toggle(l, f.id))}>
                      <span className="pick__name">{f.label}</span>
                      <span className="pick__meta">{f.blurb}</span>
                      <span className="pick__check" aria-hidden="true">
                        <Check size={16} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </StepHead>
          )}

          {step === 4 && (
            <StepHead headingRef={headingRef} kicker="Step 5 · Preferences" title="Make it" outline="feel local" lede="Time zone sets lock times and reminders. Notifications are saved now and used when alerts launch — nothing is sent yet.">
              <div className="onb__prefs">
                <div className="panel panel--glass onb__pref-card">
                  <div className="field">
                    <label htmlFor="onb-tz" className="field__label">
                      Time zone
                    </label>
                    <select id="onb-tz" className="input" value={effectiveTz} onChange={(e) => setTz(e.target.value)}>
                      {zoneOptions.map((z) => (
                        <option key={z} value={z}>
                          {z.replace(/_/g, " ")}
                          {z === detectedTz ? " (detected)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="onb-lang" className="field__label">
                      Language
                    </label>
                    <select id="onb-lang" className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                      {LANGUAGES.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <span className="field__hint">The interface is English for now; we&apos;ll switch as translations ship.</span>
                  </div>
                </div>
                <fieldset className="panel panel--glass onb__pref-card">
                  <legend className="field__label">Notify me about</legend>
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.key} className="toggle-row">
                      <div>
                        <div className="field__label">{n.label}</div>
                        <div className="field__hint">{n.hint}</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifications[n.key]}
                        aria-label={n.label}
                        className="switch"
                        onClick={() => setNotifications((s) => ({ ...s, [n.key]: !s[n.key] }))}
                      />
                    </div>
                  ))}
                </fieldset>
              </div>
            </StepHead>
          )}
        </div>

        {error && <FormNotice tone="error">{error}</FormNotice>}

        <div className="onb__actions">
          {step > 0 ? (
            <button type="button" className="btn btn--ghost" onClick={() => go(step - 1, false)} disabled={pending}>
              <ArrowLeft size={18} aria-hidden="true" />
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}
          <div className="onb__actions-right">
            {optional && (
              <button type="button" className="btn btn--glass" onClick={() => go(step + 1, false)} disabled={pending}>
                <span>{step === LAST ? "Skip & finish" : "Skip"}</span>
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={() => go(step + 1, true)} disabled={pending} aria-busy={pending}>
              {pending ? <Loader2 size={18} className="spin" aria-hidden="true" /> : null}
              <span>{step === LAST ? "Finish setup" : "Continue"}</span>
              {!pending && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepHead({
  headingRef,
  kicker,
  title,
  outline,
  lede,
  children,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  kicker: string;
  title: string;
  outline: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="onb__content">
      <span className="kicker">{kicker}</span>
      <h1 id="onb-title" ref={headingRef} tabIndex={-1} className="display onb__title">
        {title} <span className="text-outline">{outline}</span>
      </h1>
      <p className="lede onb__lede">{lede}</p>
      {children}
    </div>
  );
}

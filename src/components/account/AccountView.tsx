"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/primitives";
import { SportBall } from "@/components/art/SportBall";
import { UniverseGlyph } from "@/components/shell/SportSwitcher";
import { FormNotice } from "@/components/auth/FormParts";
import { NewPasswordForm } from "@/components/auth/AuthForms";
import { useAuth } from "@/components/auth/AuthProvider";
import { restartOnboarding, updateProfile, type ProfilePatch, type SaveResult } from "@/app/actions/profile";
import { signOut } from "@/app/actions/auth";
import { LANGUAGES, NOTIFICATIONS, formatsFor, validateDisplayName, type Profile } from "@/lib/profile";
import { PLATFORMS } from "@/lib/platforms";
import { SPORT_LIST, type SportId } from "@/lib/sports";
import { metaFor, type Selection } from "@/lib/universe";
import { sportStore } from "@/lib/preferences";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/use-hydrated";

export function AccountView({ profile: initial, email, provider }: { profile: Profile; email: string; provider: string }) {
  const [profile, setLocal] = useState(initial);
  const { setProfile } = useAuth();
  const onSaved = (p: Profile) => {
    setLocal(p);
    setProfile(p);
  };

  return (
    <>
      <PageHero kicker="Account" title={profile.display_name ? `Hey ${profile.display_name.split(" ")[0]}` : "Your"} outline="account" lede={`Signed in as ${email}. Everything here is private to you.`} />
      <section className="section section--tight">
        <div className="container settings">
          <IdentitySection profile={profile} onSaved={onSaved} />
          <InterestsSection profile={profile} onSaved={onSaved} />
          <PreferencesSection profile={profile} onSaved={onSaved} />
          <SecuritySection email={email} provider={provider} />
        </div>
      </section>
    </>
  );
}

/* ---------- shared save plumbing ---------- */

function useSave(onSaved: (p: Profile) => void) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const save = (patch: ProfilePatch, after?: (p: Profile) => void) =>
    start(async () => {
      setResult(null);
      const res: SaveResult = await updateProfile(patch);
      if (res.ok) {
        onSaved(res.profile);
        after?.(res.profile);
        setResult({ tone: "success", text: "Saved." });
      } else setResult({ tone: "error", text: res.error });
    });
  return { pending, result, save };
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
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

function SaveBar({ pending, result, onSave, dirty, label = "Save changes" }: { pending: boolean; result: { tone: "success" | "error"; text: string } | null; onSave: () => void; dirty: boolean; label?: string }) {
  return (
    <div className="savebar">
      <div aria-live="polite" className="savebar__status">
        {result && result.tone === "success" && !dirty && (
          <span className="savebar__ok">
            <Check size={16} aria-hidden="true" /> {result.text}
          </span>
        )}
      </div>
      {result?.tone === "error" && <FormNotice tone="error">{result.text}</FormNotice>}
      <button type="button" className="btn btn--primary" onClick={onSave} disabled={pending || !dirty} aria-busy={pending}>
        {pending && <Loader2 size={18} className="spin" aria-hidden="true" />}
        <span>{pending ? "Saving…" : label}</span>
      </button>
    </div>
  );
}

/* ---------- Identity ---------- */

function IdentitySection({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [name, setName] = useState(profile.display_name ?? "");
  const { pending, result, save } = useSave(onSaved);
  const err = name ? validateDisplayName(name) : null;
  const dirty = name.trim() !== (profile.display_name ?? "");
  return (
    <Section title="Profile" hint="How you appear across UniFantasy.">
      <div className="field">
        <label htmlFor="acc-name" className="field__label">
          Display name
        </label>
        <input id="acc-name" className={cn("input", err && "input--error")} value={name} maxLength={40} autoComplete="nickname" onChange={(e) => setName(e.target.value)} aria-invalid={err ? true : undefined} aria-describedby={err ? "acc-name-err" : undefined} />
        {err && (
          <span id="acc-name-err" className="field__error">
            {err}
          </span>
        )}
      </div>
      <SaveBar pending={pending} result={result} dirty={dirty && !err} onSave={() => save({ display_name: name })} />
    </Section>
  );
}

/* ---------- Interests (sports, home universe, platforms, formats) ---------- */

function InterestsSection({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [sports, setSports] = useState<SportId[]>(profile.favorite_sports);
  const [home, setHome] = useState<Selection>(profile.home_universe);
  const [platforms, setPlatforms] = useState(profile.platforms);
  const [formats, setFormats] = useState<string[]>(profile.formats);
  const { pending, result, save } = useSave(onSaved);

  const homeOptions: Selection[] = ["all", ...sports];
  const safeHome = homeOptions.includes(home) ? home : "all";
  const available = formatsFor(sports);
  const toggle = <T,>(l: T[], v: T) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);
  const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));
  const dirty = !same(sports, profile.favorite_sports) || safeHome !== profile.home_universe || !same(platforms, profile.platforms) || !same(formats, profile.formats);

  return (
    <Section title="Interests" hint="Shapes your dashboard and the order of sports in navigation. All six sports always stay available.">
      <div>
        <span className="field__label">Sports you play</span>
        <div className="fav-list" role="group" aria-label="Sports you play">
          {SPORT_LIST.map((s) => {
            const on = sports.includes(s.id);
            return (
              <button key={s.id} type="button" data-sport={s.id} className={cn("fav", on && "is-on")} aria-pressed={on} onClick={() => setSports((l) => toggle(l, s.id))}>
                <span className="fav__ball" aria-hidden="true">
                  <SportBall sport={s.id} />
                </span>
                {s.league}
                {on && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <span className="field__label" id="acc-home">
          Home universe
        </span>
        <div className="segmented" role="radiogroup" aria-labelledby="acc-home">
          {homeOptions.map((h) => (
            <button key={h} type="button" role="radio" aria-checked={safeHome === h} data-sport={h} onClick={() => setHome(h)}>
              <span className="onb__home-glyph" aria-hidden="true">
                <UniverseGlyph sel={h} />
              </span>
              {metaFor(h).league}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="field__label">Platforms</span>
        <div className="fav-list" role="group" aria-label="Platforms you use">
          {PLATFORMS.map((p) => {
            const on = platforms.includes(p.id);
            return (
              <button key={p.id} type="button" className={cn("fav", on && "is-on")} aria-pressed={on} onClick={() => setPlatforms((l) => toggle(l, p.id))}>
                {p.name}
                {on && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <span className="field__label">Formats</span>
        <div className="fav-list" role="group" aria-label="Formats you play">
          {available.map((f) => {
            const on = formats.includes(f.id);
            return (
              <button key={f.id} type="button" className={cn("fav", on && "is-on")} aria-pressed={on} onClick={() => setFormats((l) => toggle(l, f.id))} title={f.blurb}>
                {f.label}
                {on && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
      <SaveBar
        pending={pending}
        result={result}
        dirty={dirty}
        onSave={() =>
          save({ favorite_sports: sports, home_universe: safeHome, platforms, formats: formats as ProfilePatch["formats"] }, (p) => {
            if (!window.location.pathname.startsWith("/universe")) {
              document.documentElement.dataset.sport = p.home_universe;
              sportStore.set(p.home_universe);
            }
          })
        }
      />
    </Section>
  );
}

/* ---------- Preferences ---------- */

function PreferencesSection({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const hydrated = useHydrated();
  const zones = useMemo(() => {
    if (!hydrated) return [profile.time_zone];
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [profile.time_zone];
    }
  }, [hydrated, profile.time_zone]);
  const [tz, setTz] = useState(profile.time_zone);
  const [language, setLanguage] = useState<string>(profile.language);
  const [notifications, setNotifications] = useState(profile.notifications);
  const { pending, result, save } = useSave(onSaved);
  const dirty =
    tz !== profile.time_zone ||
    language !== profile.language ||
    NOTIFICATIONS.some((n) => notifications[n.key] !== profile.notifications[n.key]);

  return (
    <Section title="Preferences" hint="Time zone, language and the alerts you want when notifications launch (nothing is sent yet).">
      <div className="acc-two">
        <div className="field">
          <label htmlFor="acc-tz" className="field__label">
            Time zone
          </label>
          <select id="acc-tz" className="input" value={tz} onChange={(e) => setTz(e.target.value)}>
            {(zones.includes(tz) ? zones : [tz, ...zones]).map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="acc-lang" className="field__label">
            Language
          </label>
          <select id="acc-lang" className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="acc-notifs">
        <legend className="field__label">Notifications</legend>
        {NOTIFICATIONS.map((n) => (
          <div key={n.key} className="toggle-row">
            <div>
              <div className="field__label">{n.label}</div>
              <div className="field__hint">{n.hint}</div>
            </div>
            <button type="button" role="switch" aria-checked={notifications[n.key]} aria-label={n.label} className="switch" onClick={() => setNotifications((s) => ({ ...s, [n.key]: !s[n.key] }))} />
          </div>
        ))}
      </fieldset>
      <SaveBar pending={pending} result={result} dirty={dirty} onSave={() => save({ time_zone: tz, language: language as ProfilePatch["language"], notifications })} />
    </Section>
  );
}

/* ---------- Security ---------- */

function SecuritySection({ email, provider }: { email: string; provider: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Section title="Security" hint="Sign-in, password and sessions.">
      <div className="acc-identity">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <div className="field__label">{email}</div>
          <div className="field__hint">Signed in with {provider === "google" ? "Google" : "email and password"}. Passwords are handled by our auth provider and never stored by UniFantasy.</div>
        </div>
      </div>
      {provider !== "google" && (
        <details className="acc-details">
          <summary className="field__label">Change password</summary>
          <NewPasswordForm from="account" />
        </details>
      )}
      <div className="btn-row">
        <form action={signOut}>
          <button type="submit" className="btn btn--ghost">
            <LogOut size={18} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </form>
        <form action={signOut}>
          <input type="hidden" name="scope" value="global" />
          <button type="submit" className="btn btn--ghost">
            <span>Sign out on all devices</span>
          </button>
        </form>
        <button
          type="button"
          className="btn btn--glass"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await restartOnboarding();
              if (res.ok) router.push("/onboarding");
            })
          }
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Run setup again</span>
        </button>
      </div>
    </Section>
  );
}

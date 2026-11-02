"use client";

import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SportBall } from "@/components/art/SportBall";
import { Chip, Reveal } from "@/components/ui/primitives";
import { useSelection } from "@/lib/preferences";
import { useSwitchUniverse } from "@/lib/use-switch";
import { FORMATS, ONBOARDING_STEPS } from "@/lib/profile";
import { PLATFORMS } from "@/lib/platforms";
import { SPORTS } from "@/lib/sports";
import { cn } from "@/lib/cn";

/** Dashboard band that adapts to the visitor: guest, mid-setup, or set up. */
export function PersonalStrip() {
  const { status, profile } = useAuth();
  const selection = useSelection();
  const switchTo = useSwitchUniverse();

  if (status === "unconfigured" || status === "loading") return null;

  if (status === "signed-out" || !profile) {
    return (
      <div className="container">
        <Reveal className="pstrip pstrip--guest panel panel--glass">
          <div>
            <span className="kicker">Make it yours</span>
            <p className="pstrip__lead">Save your sports, platforms and formats — and come back to the same universe on any device.</p>
          </div>
          <div className="btn-row">
            <Link href="/register" className="btn btn--primary">
              <span>Create account</span>
            </Link>
            <Link href="/login" className="btn btn--ghost">
              <span>Sign in</span>
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const name = profile.display_name?.split(" ")[0] ?? "manager";

  if (!profile.onboarding_completed_at) {
    return (
      <div className="container">
        <Reveal className="pstrip panel panel--hot">
          <div>
            <span className="kicker">Almost there, {name}</span>
            <p className="pstrip__lead">
              Finish setup — step {profile.onboarding_step + 1} of {ONBOARDING_STEPS.length} — to personalise your dashboard.
            </p>
          </div>
          <Link href="/onboarding" className="btn btn--glass">
            <span>Continue setup</span>
            <span className="btn__icon">
              <ArrowRight size={18} />
            </span>
          </Link>
        </Reveal>
      </div>
    );
  }

  const platforms = PLATFORMS.filter((p) => profile.platforms.includes(p.id));
  const formats = FORMATS.filter((f) => profile.formats.includes(f.id));

  return (
    <div className="container">
      <Reveal className="pstrip pstrip--you panel">
        <div className="pstrip__hello">
          <span className="kicker">Your universe</span>
          <h2 className="display display-m">Welcome back, {name}</h2>
          <Link href="/account" className="text-link pstrip__edit">
            <Pencil size={14} aria-hidden="true" /> Edit preferences
          </Link>
        </div>

        <div className="pstrip__block">
          <span className="field__label">Your sports</span>
          {profile.favorite_sports.length ? (
            <div className="pstrip__sports" role="group" aria-label="Jump to one of your sports">
              {profile.favorite_sports.map((id) => (
                <button
                  key={id}
                  type="button"
                  data-sport={id}
                  aria-pressed={selection === id}
                  className={cn("pstrip__sport", selection === id && "is-active")}
                  onClick={(e) => switchTo(id, { x: e.clientX || innerWidth / 2, y: e.clientY || innerHeight / 2 })}
                >
                  <span className="pstrip__ball" aria-hidden="true">
                    <SportBall sport={id} />
                  </span>
                  {SPORTS[id].short}
                </button>
              ))}
            </div>
          ) : (
            <p className="field__hint">
              None picked yet — <Link href="/account" className="text-link">add some</Link>. All six stay in the switcher.
            </p>
          )}
        </div>

        <div className="pstrip__block">
          <span className="field__label">Platforms & formats</span>
          <div className="dict__chips">
            {platforms.map((p) => (
              <Chip key={p.id} tone="accent">
                {p.name}
              </Chip>
            ))}
            {formats.map((f) => (
              <Chip key={f.id}>{f.label}</Chip>
            ))}
            {!platforms.length && !formats.length && <span className="field__hint">Not set — add them in Account.</span>}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

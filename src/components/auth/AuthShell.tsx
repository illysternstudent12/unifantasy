"use client";

import type { ReactNode } from "react";
import { SportScene } from "@/components/art/SportScene";
import { FormNotice } from "./FormParts";
import { useSelection } from "@/lib/preferences";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { metaFor } from "@/lib/universe";

/**
 * Cinematic split layout for auth screens: the active universe fills the
 * stage, the form sits on a glass panel. Mobile stacks with the form first.
 */
export function AuthShell({ kicker, title, outline, lede, children }: { kicker: string; title: string; outline: string; lede: string; children: ReactNode }) {
  const selection = useSelection();
  const m = metaFor(selection);
  return (
    <section className="auth">
      <SportScene key={selection} sport={selection} variant="hero" backdrop depth={0.06} className="auth__scene" />
      <div className="container auth__grid">
        <div className="auth__intro">
          <span className="kicker">
            {m.league} · {kicker}
          </span>
          <h1 className="display auth__title">
            {title}
            <br />
            <span className="text-outline">{outline}</span>
          </h1>
          <p className="lede">{lede}</p>
        </div>
        <div className="auth__panel panel panel--glass">
          {!isSupabaseConfigured && (
            <FormNotice tone="info">
              <strong>Accounts aren&apos;t connected in this build.</strong> Add the Supabase keys described in the README to switch
              sign-in on. Everything else in UniFantasy works without an account.
            </FormNotice>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

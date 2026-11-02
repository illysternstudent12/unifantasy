"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, signIn, signUp, updatePassword, type FormState } from "@/app/actions/auth";
import { Field, FormNotice, PasswordField, SubmitButton } from "./FormParts";
import { GoogleButton } from "./GoogleButton";

const idle: FormState = { status: "idle" };

const LINK_ERRORS: Record<string, string> = {
  link: "That link is invalid or has expired. Request a new one.",
  provider: "Google sign-in was cancelled or failed. Try again or use email.",
  "not-configured": "Accounts aren't connected in this build yet.",
};

/* ---------- Sign in ---------- */

export function LoginForm({ next, linkError, notice }: { next: string; linkError?: string; notice?: string }) {
  const [state, action] = useActionState(signIn, idle);
  return (
    <form action={action} className="auth-form" noValidate>
      <h2 className="display display-s">Sign in</h2>
      {linkError && <FormNotice tone="error">{LINK_ERRORS[linkError] ?? LINK_ERRORS.link}</FormNotice>}
      {notice && <FormNotice tone="success">{notice}</FormNotice>}
      <GoogleButton next={next} />
      {state.message && <FormNotice tone={state.status === "success" ? "success" : "error"}>{state.message}</FormNotice>}
      <input type="hidden" name="next" value={next} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField autoComplete="current-password" error={state.fieldErrors?.password} />
      <div className="auth-form__row">
        <Link href="/forgot-password" className="text-link">
          Forgot password?
        </Link>
      </div>
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
      <p className="auth-form__alt">
        New to UniFantasy?{" "}
        <Link href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-link">
          Create an account
        </Link>
      </p>
    </form>
  );
}

/* ---------- Register ---------- */

export function RegisterForm() {
  const [state, action] = useActionState(signUp, idle);
  if (state.status === "success") {
    return (
      <div className="auth-form">
        <h2 className="display display-s">Check your inbox</h2>
        <FormNotice tone="success">{state.message}</FormNotice>
        <p className="panel__text">Didn&apos;t get it? Check spam, or wait a minute and register again with the same email.</p>
        <Link href="/login" className="btn btn--ghost btn--block">
          <span>Back to sign in</span>
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="auth-form" noValidate>
      <h2 className="display display-s">Create your account</h2>
      <GoogleButton next="/onboarding" />
      {state.message && <FormNotice tone="error">{state.message}</FormNotice>}
      <Field
        label="Display name"
        name="displayName"
        autoComplete="nickname"
        required
        maxLength={40}
        defaultValue={state.values?.displayName}
        error={state.fieldErrors?.displayName}
        hint="Shown in your leagues and greetings."
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField autoComplete="new-password" meter error={state.fieldErrors?.password} />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      <p className="auth-form__fine">We only use your email to sign you in and, if you choose, to send the alerts you pick.</p>
      <p className="auth-form__alt">
        Already have an account?{" "}
        <Link href="/login" className="text-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}

/* ---------- Forgot password ---------- */

export function ForgotForm({ expired }: { expired?: boolean }) {
  const [state, action] = useActionState(requestPasswordReset, idle);
  return (
    <form action={action} className="auth-form" noValidate>
      <h2 className="display display-s">Reset your password</h2>
      {expired && state.status === "idle" && <FormNotice tone="error">That reset link has expired. Request a new one below.</FormNotice>}
      {state.message && <FormNotice tone={state.status === "success" ? "success" : "error"}>{state.message}</FormNotice>}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        hint="We'll email you a secure link."
      />
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
      <p className="auth-form__alt">
        Remembered it?{" "}
        <Link href="/login" className="text-link">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

/* ---------- Set new password (from recovery link, or from Account) ---------- */

export function NewPasswordForm({ from }: { from: "reset" | "account" }) {
  const [state, action] = useActionState(updatePassword, idle);
  return (
    <form action={action} className="auth-form" noValidate>
      {from === "reset" && <h2 className="display display-s">Choose a new password</h2>}
      {state.message && <FormNotice tone={state.status === "success" ? "success" : "error"}>{state.message}</FormNotice>}
      <input type="hidden" name="from" value={from} />
      <PasswordField label="New password" autoComplete="new-password" meter error={state.fieldErrors?.password} />
      <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" error={state.fieldErrors?.confirm} />
      <SubmitButton pendingText="Saving…">{from === "reset" ? "Save and continue" : "Update password"}</SubmitButton>
    </form>
  );
}

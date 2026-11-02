"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { passwordScore } from "@/lib/profile";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

/** Labelled input with inline error wired to aria-invalid / aria-describedby. */
export function Field({ label, name, error, hint, className, ...input }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  return (
    <div className={cn("field", className)}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        className={cn("input", error && "input--error")}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined}
        {...input}
      />
      {hint && !error && (
        <span id={hintId} className="field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errId} className="field__error">
          <AlertCircle size={14} aria-hidden="true" /> {error}
        </span>
      )}
    </div>
  );
}

/** Password input with show/hide and an optional strength meter. */
export function PasswordField({
  label = "Password",
  name = "password",
  error,
  meter = false,
  autoComplete,
  hint,
}: {
  label?: string;
  name?: string;
  error?: string;
  meter?: boolean;
  autoComplete: "current-password" | "new-password";
  hint?: ReactNode;
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const score = passwordScore(value);
  const words = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="pw">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          className={cn("input", error && "input--error")}
          autoComplete={autoComplete}
          required
          maxLength={72}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint || meter ? `${id}-hint` : undefined}
        />
        <button type="button" className="pw__toggle" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
          {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {meter && value && (
        <div className="pw__meter" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn(i < score && `is-on is-${score}`)} />
          ))}
        </div>
      )}
      {!error && (meter || hint) && (
        <span id={`${id}-hint`} className="field__hint">
          {meter && value ? `${words[score]} · ` : ""}
          {hint ?? "8+ characters with letters and numbers."}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className="field__error">
          <AlertCircle size={14} aria-hidden="true" /> {error}
        </span>
      )}
    </div>
  );
}

/** Submit button that shows progress while the server action runs. */
export function SubmitButton({ children, pendingText, className }: { children: ReactNode; pendingText: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={cn("btn btn--primary btn--block", className)} disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 size={18} className="spin" aria-hidden="true" />
          <span>{pendingText}</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}

/** Form-level message: errors are announced assertively, successes politely. */
export function FormNotice({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <div className={cn("notice", `notice--${tone}`)} role={tone === "error" ? "alert" : "status"}>
      {tone === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}

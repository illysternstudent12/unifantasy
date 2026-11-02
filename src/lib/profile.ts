import { SPORT_IDS, isSportId, type SportId } from "./sports";
import { PLATFORMS } from "./platforms";
import { isSelection, type Selection } from "./universe";

/**
 * Profile model + validation shared by client forms and server actions.
 * The server always re-validates; client checks are for fast feedback only.
 * Mirrors supabase/migrations/0001_profiles.sql (DB constraints are the last line).
 */

export type FormatId = (typeof FORMATS)[number]["id"];
export type LanguageId = (typeof LANGUAGES)[number]["id"];
export type NotificationKey = (typeof NOTIFICATIONS)[number]["key"];

export type Profile = {
  id: string;
  display_name: string | null;
  favorite_sports: SportId[];
  home_universe: Selection;
  platforms: string[];
  formats: FormatId[];
  time_zone: string;
  language: LanguageId;
  notifications: Record<NotificationKey, boolean>;
  onboarding_step: number;
  onboarding_completed_at: string | null;
};

/** Fantasy formats. `sports` empty = applies to every sport. */
export const FORMATS = [
  { id: "h2h_points", label: "Head-to-head points", sports: [] as SportId[], blurb: "Weekly matchups decided by total points." },
  { id: "h2h_categories", label: "Head-to-head categories", sports: ["nba", "mlb", "nhl"] as SportId[], blurb: "Win the week category by category." },
  { id: "roto", label: "Rotisserie", sports: ["nba", "mlb", "nhl"] as SportId[], blurb: "Season-long ranks across every category." },
  { id: "points", label: "Season points", sports: [] as SportId[], blurb: "Total points across the whole season." },
  { id: "ppr", label: "PPR", sports: ["nfl"] as SportId[], blurb: "A full point per reception." },
  { id: "half_ppr", label: "Half-PPR", sports: ["nfl"] as SportId[], blurb: "Half a point per reception." },
  { id: "standard", label: "Standard (non-PPR)", sports: ["nfl"] as SportId[], blurb: "No points for receptions." },
  { id: "classic", label: "Classic", sports: ["soccer", "euroleague"] as SportId[], blurb: "Budget squad, transfers and a captain each round." },
  { id: "draft", label: "Draft", sports: [] as SportId[], blurb: "Snake or auction draft — every player owned once." },
  { id: "best_ball", label: "Best ball", sports: ["nfl", "nba", "mlb"] as SportId[], blurb: "No lineups — your best scores count." },
  { id: "dynasty", label: "Dynasty / keeper", sports: [] as SportId[], blurb: "Rosters carry across seasons." },
  { id: "daily", label: "Daily / single slate", sports: [] as SportId[], blurb: "New contest every slate." },
] as const;

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
  { id: "el", label: "Ελληνικά" },
  { id: "tr", label: "Türkçe" },
] as const;

/** Notification categories — modelled on the alert types fantasy apps commonly offer. */
export const NOTIFICATIONS = [
  { key: "lineup", label: "Lineup reminders", hint: "Before lock, if a starter is out or a slot is empty." },
  { key: "injury", label: "Injury & status", hint: "When a player you roster changes status." },
  { key: "trades", label: "Trades & transactions", hint: "Offers, accepted trades, waiver and transfer results." },
  { key: "news", label: "Breaking news", hint: "Major news about players you follow." },
  { key: "recap", label: "Weekly recap", hint: "A summary of your week across every sport." },
] as const;

export const DEFAULT_NOTIFICATIONS: Record<NotificationKey, boolean> = {
  lineup: true,
  injury: true,
  trades: true,
  news: false,
  recap: true,
};

export const ONBOARDING_STEPS = ["Welcome", "Sports", "Platforms", "Formats", "Preferences"] as const;

const FORMAT_IDS = FORMATS.map((f) => f.id) as readonly string[];
const LANGUAGE_IDS = LANGUAGES.map((l) => l.id) as readonly string[];
const PLATFORM_IDS = PLATFORMS.map((p) => p.id);
const NOTIFICATION_KEYS = NOTIFICATIONS.map((n) => n.key) as readonly string[];

/* ---------- validators ---------- */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(v: string): string | null {
  const e = v.trim();
  if (!e) return "Enter your email address.";
  if (e.length > 254 || !EMAIL_RE.test(e)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(v: string): string | null {
  if (v.length < 8) return "Use at least 8 characters.";
  if (v.length > 72) return "Use 72 characters or fewer.";
  if (!/[a-zA-Z]/.test(v) || !/[0-9]/.test(v)) return "Mix letters and numbers.";
  return null;
}

/** 0–4 score for the strength meter (feedback only; the rule above is the gate). */
export function passwordScore(v: string) {
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v) && /[^a-zA-Z0-9]/.test(v)) s++;
  return s;
}

export function validateDisplayName(v: string): string | null {
  const n = v.trim();
  if (!n) return "Tell us what to call you.";
  if (n.length > 40) return "Keep it to 40 characters.";
  if (/[<>]/.test(n)) return "Avoid < and > characters.";
  return null;
}

export function isValidTimeZone(tz: string) {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/* ---------- sanitisers: keep only known values ---------- */

export const cleanSports = (v: unknown): SportId[] => uniq(arr(v).filter(isSportId));
export const cleanPlatforms = (v: unknown): string[] => uniq(arr(v).filter((x): x is string => PLATFORM_IDS.includes(x as string)));
export const cleanFormats = (v: unknown): FormatId[] => uniq(arr(v).filter((x) => FORMAT_IDS.includes(x as string))) as FormatId[];
export const cleanLanguage = (v: unknown): LanguageId => (LANGUAGE_IDS.includes(v as string) ? (v as LanguageId) : "en");
export const cleanUniverse = (v: unknown): Selection => (isSelection(v) ? v : "all");

export function cleanNotifications(v: unknown): Record<NotificationKey, boolean> {
  const out = { ...DEFAULT_NOTIFICATIONS };
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) {
      if (NOTIFICATION_KEYS.includes(k) && typeof val === "boolean") out[k as NotificationKey] = val;
    }
  }
  return out;
}

/** Normalise a raw DB row (defensive against nulls / schema drift). */
export function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    display_name: typeof row.display_name === "string" ? row.display_name : null,
    favorite_sports: cleanSports(row.favorite_sports),
    home_universe: cleanUniverse(row.home_universe),
    platforms: cleanPlatforms(row.platforms),
    formats: cleanFormats(row.formats),
    time_zone: typeof row.time_zone === "string" && isValidTimeZone(row.time_zone) ? row.time_zone : "UTC",
    language: cleanLanguage(row.language),
    notifications: cleanNotifications(row.notifications),
    onboarding_step: typeof row.onboarding_step === "number" ? Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, row.onboarding_step)) : 0,
    onboarding_completed_at: typeof row.onboarding_completed_at === "string" ? row.onboarding_completed_at : null,
  };
}

/** Formats relevant to a set of sports (all formats when none chosen). */
export function formatsFor(sports: SportId[]) {
  if (sports.length === 0) return [...FORMATS];
  return FORMATS.filter((f) => f.sports.length === 0 || f.sports.some((s) => sports.includes(s)));
}

export const ALL_SPORT_IDS = SPORT_IDS;

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function uniq<T>(a: T[]): T[] {
  return [...new Set(a)];
}

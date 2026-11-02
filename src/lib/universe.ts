import { SPORTS, SPORT_IDS, isSportId, type Sport, type SportId } from "./sports";

/**
 * Universe layer: everything that varies by the user's *selection*, which is
 * one of the six sports or the combined "all" universe.
 *
 * Rules below are fixed format facts from each competition's rulebook (game
 * length, players on the field, …). They are not statistics or analytics,
 * and the UI labels them that way.
 */

export type Selection = SportId | "all";

export const SELECTIONS: Selection[] = ["all", ...SPORT_IDS];

export function isSelection(v: unknown): v is Selection {
  return v === "all" || isSportId(v);
}

export type Terms = {
  /** what you set each period */
  lineup: string;
  /** the full set of players you manage */
  roster: string;
  /** a head-to-head contest */
  matchup: string;
  /** adding / dropping players */
  moves: string;
  /** scoring period, capitalised */
  unit: string;
};

export type Rule = { value: string; label: string };

export type UniverseMeta = {
  id: Selection;
  name: string;
  short: string;
  league: string;
  headline: [string, string];
  tagline: string;
  atmosphere: string;
  themeName: string;
  hex: { accent: string; accent2: string; deep: string };
  period: string;
  terms: Terms;
};

export const TERMS: Record<SportId, Terms> = {
  nba: { lineup: "Lineup", roster: "Roster", matchup: "Matchup", moves: "Waivers", unit: "Game" },
  nfl: { lineup: "Lineup", roster: "Roster", matchup: "Matchup", moves: "Waivers", unit: "Week" },
  soccer: { lineup: "Starting XI", roster: "Squad", matchup: "Fixture", moves: "Transfers", unit: "Gameweek" },
  mlb: { lineup: "Lineup", roster: "Roster", matchup: "Matchup", moves: "Waivers", unit: "Game" },
  nhl: { lineup: "Lines", roster: "Roster", matchup: "Matchup", moves: "Waivers", unit: "Game" },
  euroleague: { lineup: "Lineup", roster: "Roster", matchup: "Round", moves: "Transfers", unit: "Round" },
};

export const ALL_TERMS: Terms = { lineup: "Lineup", roster: "Roster", matchup: "Matchup", moves: "Moves", unit: "Period" };

export const POSITION_NAMES: Record<SportId, Record<string, string>> = {
  nba: { PG: "Point guard", SG: "Shooting guard", SF: "Small forward", PF: "Power forward", C: "Center" },
  nfl: { QB: "Quarterback", RB: "Running back", WR: "Wide receiver", TE: "Tight end", K: "Kicker", DST: "Defense / special teams" },
  soccer: { GK: "Goalkeeper", DEF: "Defender", MID: "Midfielder", FWD: "Forward" },
  mlb: { C: "Catcher", "1B": "First base", "2B": "Second base", "3B": "Third base", SS: "Shortstop", OF: "Outfield", SP: "Starting pitcher", RP: "Relief pitcher" },
  nhl: { C: "Center", LW: "Left wing", RW: "Right wing", D: "Defense", G: "Goalie" },
  euroleague: { G: "Guard", F: "Forward", C: "Center" },
};

export const RULES: Record<SportId, Rule[]> = {
  nba: [
    { value: "48", label: "Minutes per game" },
    { value: "4", label: "Twelve-minute quarters" },
    { value: "5", label: "Players on court per team" },
    { value: "24s", label: "Shot clock" },
  ],
  nfl: [
    { value: "60", label: "Minutes per game" },
    { value: "4", label: "Fifteen-minute quarters" },
    { value: "11", label: "Players on field per team" },
    { value: "100", label: "Yards between goal lines" },
  ],
  soccer: [
    { value: "90", label: "Minutes per match" },
    { value: "11", label: "Players per side" },
    { value: "15", label: "Players in an FPL squad" },
    { value: "3", label: "FPL max per club" },
  ],
  mlb: [
    { value: "9", label: "Innings per game" },
    { value: "9", label: "Fielders on defense" },
    { value: "3", label: "Outs per half-inning" },
    { value: "90ft", label: "Between the bases" },
  ],
  nhl: [
    { value: "60", label: "Minutes per game" },
    { value: "3", label: "Twenty-minute periods" },
    { value: "6", label: "Players on ice per team" },
    { value: "200ft", label: "Rink length" },
  ],
  euroleague: [
    { value: "40", label: "Minutes per game" },
    { value: "4", label: "Ten-minute quarters" },
    { value: "5", label: "Players on court per team" },
    { value: "6.75m", label: "Three-point distance" },
  ],
};

export const ALL_META: UniverseMeta = {
  id: "all",
  name: "All Sports",
  short: "ALL",
  league: "All Sports",
  headline: ["Every", "Arena"],
  tagline: "Six sports, six atmospheres, one command centre for every league you run.",
  atmosphere: "Hardwood, turf, grass, dirt, ice and smoke — all under one roof.",
  themeName: "Championship Gold",
  hex: { accent: "#ffc83d", accent2: "#fff0b8", deep: "#120d1c" },
  period: "per period",
  terms: ALL_TERMS,
};

export function metaFor(sel: Selection): UniverseMeta {
  if (sel === "all") return ALL_META;
  const s: Sport = SPORTS[sel];
  return { ...s, terms: TERMS[sel] };
}

export function universeHref(sel: Selection) {
  return sel === "all" ? "/universe" : `/universe/${sel}`;
}

export function universeIndex(sel: SportId) {
  return SPORT_IDS.indexOf(sel);
}

/** Side-by-side format comparison for the All Sports universe (rulebook facts). */
export const FORMAT: Record<SportId, { length: string; onField: string; periods: string }> = {
  nba: { length: "48 min", onField: "5", periods: "4 quarters" },
  nfl: { length: "60 min", onField: "11", periods: "4 quarters" },
  soccer: { length: "90 min", onField: "11", periods: "2 halves" },
  mlb: { length: "9 innings", onField: "9", periods: "9 innings" },
  nhl: { length: "60 min", onField: "6", periods: "3 periods" },
  euroleague: { length: "40 min", onField: "5", periods: "4 quarters" },
};

export const TERM_LABELS: { key: keyof Terms; label: string }[] = [
  { key: "lineup", label: "Lineup" },
  { key: "roster", label: "Roster" },
  { key: "matchup", label: "Head-to-head" },
  { key: "moves", label: "Player moves" },
  { key: "unit", label: "Scoring period" },
];

/** "All", then the user's favourite sports, then the rest — every sport stays available. */
export function orderedSelections(favorites: readonly SportId[]): Selection[] {
  const favs = SPORT_IDS.filter((s) => favorites.includes(s));
  const rest = SPORT_IDS.filter((s) => !favorites.includes(s));
  return ["all", ...favs, ...rest];
}

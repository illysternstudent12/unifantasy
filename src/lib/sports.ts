/**
 * Sport registry — the single source of truth for every sport-specific
 * token, label and configuration in UniFantasy.
 *
 * Colors live in CSS (src/styles/tokens.css, keyed by [data-sport]) so the
 * browser can animate between them; this file holds the matching hex values
 * only for places CSS can't reach (meta theme-color, SVG gradient stops).
 *
 * NOTE: nothing here is live sports data. Scoring categories and roster
 * slots are generic, editable defaults used by the Strategy Lab tools.
 */

export const SPORT_IDS = ["nba", "nfl", "soccer", "mlb", "nhl", "euroleague"] as const;
export type SportId = (typeof SPORT_IDS)[number];

export type ScoringStat = {
  key: string;
  label: string;
  /** default fantasy points per unit — a common starting point, user-editable */
  defaultPoints: number;
  min: number;
  max: number;
  step: number;
  /** raw units per scoring unit, e.g. 25 passing yards = 1 unit */
  per?: number;
};

export type RosterSlot = { key: string; label: string; defaultCount: number; max: number };

export type Sport = {
  id: SportId;
  name: string;
  short: string;
  league: string;
  /** oversized editorial headline used across hero sections */
  headline: [string, string];
  tagline: string;
  atmosphere: string;
  themeName: string;
  hex: { accent: string; accent2: string; deep: string };
  /** generic unit used in copy: "per game", "per match", "per gameweek" */
  period: string;
  positions: string[];
  scoring: ScoringStat[];
  roster: RosterSlot[];
};

export const SPORTS: Record<SportId, Sport> = {
  nba: {
    id: "nba",
    name: "Basketball",
    short: "NBA",
    league: "NBA",
    headline: ["Own the", "Hardwood"],
    tagline: "Pace, usage and minutes — every possession tells a story.",
    atmosphere: "Arena lights. Copper haze. Forty-eight minutes of noise.",
    themeName: "Fire & Copper",
    hex: { accent: "#ff6a1a", accent2: "#ffb070", deep: "#1c0903" },
    period: "per game",
    positions: ["PG", "SG", "SF", "PF", "C"],
    scoring: [
      { key: "pts", label: "Points", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "reb", label: "Rebounds", defaultPoints: 1.2, min: 0, max: 3, step: 0.1 },
      { key: "ast", label: "Assists", defaultPoints: 1.5, min: 0, max: 3, step: 0.1 },
      { key: "stl", label: "Steals", defaultPoints: 3, min: 0, max: 5, step: 0.5 },
      { key: "blk", label: "Blocks", defaultPoints: 3, min: 0, max: 5, step: 0.5 },
      { key: "tov", label: "Turnovers", defaultPoints: -1, min: -3, max: 0, step: 0.5 },
    ],
    roster: [
      { key: "g", label: "Guard", defaultCount: 2, max: 4 },
      { key: "f", label: "Forward", defaultCount: 2, max: 4 },
      { key: "c", label: "Center", defaultCount: 1, max: 3 },
      { key: "util", label: "Utility", defaultCount: 3, max: 5 },
      { key: "bn", label: "Bench", defaultCount: 3, max: 8 },
    ],
  },
  nfl: {
    id: "nfl",
    name: "Football",
    short: "NFL",
    league: "NFL",
    headline: ["Win the", "Trenches"],
    tagline: "Snap shares, red-zone looks and the waiver wire on Tuesday night.",
    atmosphere: "Friday lights on Sunday. Turf, steam, emerald glow.",
    themeName: "Emerald Field",
    hex: { accent: "#16e08a", accent2: "#8dffc4", deep: "#03170d" },
    period: "per week",
    positions: ["QB", "RB", "WR", "TE", "K", "DST"],
    scoring: [
      { key: "passyd", label: "Passing yards", defaultPoints: 1, min: 0, max: 2, step: 0.5, per: 25 },
      { key: "passtd", label: "Passing TD", defaultPoints: 4, min: 0, max: 6, step: 1 },
      { key: "rushyd", label: "Rushing yards", defaultPoints: 1, min: 0, max: 2, step: 0.5, per: 10 },
      { key: "rec", label: "Reception", defaultPoints: 0.5, min: 0, max: 1, step: 0.5 },
      { key: "td", label: "Rush / Rec TD", defaultPoints: 6, min: 0, max: 8, step: 1 },
      { key: "int", label: "Interception thrown", defaultPoints: -2, min: -4, max: 0, step: 1 },
    ],
    roster: [
      { key: "qb", label: "QB", defaultCount: 1, max: 2 },
      { key: "rb", label: "RB", defaultCount: 2, max: 4 },
      { key: "wr", label: "WR", defaultCount: 2, max: 4 },
      { key: "te", label: "TE", defaultCount: 1, max: 2 },
      { key: "flex", label: "Flex", defaultCount: 1, max: 3 },
      { key: "bn", label: "Bench", defaultCount: 6, max: 10 },
    ],
  },
  soccer: {
    id: "soccer",
    name: "Soccer",
    short: "FPL",
    league: "Soccer / FPL",
    headline: ["Rule the", "Pitch"],
    tagline: "Fixtures, rotation risk and the captaincy call that defines a gameweek.",
    atmosphere: "Floodlit grass. Electric lime. Ninety minutes of tension.",
    themeName: "Electric Lime",
    hex: { accent: "#c8ff1e", accent2: "#5ee87f", deep: "#0a1604" },
    period: "per gameweek",
    positions: ["GK", "DEF", "MID", "FWD"],
    scoring: [
      { key: "goal", label: "Goal (MID)", defaultPoints: 5, min: 0, max: 8, step: 1 },
      { key: "assist", label: "Assist", defaultPoints: 3, min: 0, max: 5, step: 1 },
      { key: "cs", label: "Clean sheet (DEF)", defaultPoints: 4, min: 0, max: 6, step: 1 },
      { key: "mins", label: "Played 60+ min", defaultPoints: 2, min: 0, max: 3, step: 1 },
      { key: "yc", label: "Yellow card", defaultPoints: -1, min: -3, max: 0, step: 1 },
      { key: "rc", label: "Red card", defaultPoints: -3, min: -5, max: 0, step: 1 },
    ],
    roster: [
      { key: "gk", label: "Goalkeeper", defaultCount: 2, max: 2 },
      { key: "def", label: "Defender", defaultCount: 5, max: 5 },
      { key: "mid", label: "Midfielder", defaultCount: 5, max: 5 },
      { key: "fwd", label: "Forward", defaultCount: 3, max: 3 },
    ],
  },
  mlb: {
    id: "mlb",
    name: "Baseball",
    short: "MLB",
    league: "MLB",
    headline: ["Swing for", "Glory"],
    tagline: "Platoons, pitch mix and a 162-game grind measured one at-bat at a time.",
    atmosphere: "Summer dusk. Crimson seams. Chalk lines under the lights.",
    themeName: "Crimson Diamond",
    hex: { accent: "#ff2d4a", accent2: "#ff9a6b", deep: "#1a0308" },
    period: "per game",
    positions: ["C", "1B", "2B", "3B", "SS", "OF", "SP", "RP"],
    scoring: [
      { key: "r", label: "Run", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "hr", label: "Home run", defaultPoints: 4, min: 0, max: 6, step: 1 },
      { key: "rbi", label: "RBI", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "sb", label: "Stolen base", defaultPoints: 2, min: 0, max: 4, step: 0.5 },
      { key: "k", label: "Strikeout (pitcher)", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "er", label: "Earned run allowed", defaultPoints: -2, min: -4, max: 0, step: 0.5 },
    ],
    roster: [
      { key: "c", label: "C", defaultCount: 1, max: 2 },
      { key: "if", label: "Infield", defaultCount: 4, max: 6 },
      { key: "of", label: "Outfield", defaultCount: 3, max: 5 },
      { key: "sp", label: "SP", defaultCount: 5, max: 7 },
      { key: "rp", label: "RP", defaultCount: 2, max: 5 },
      { key: "bn", label: "Bench", defaultCount: 4, max: 8 },
    ],
  },
  nhl: {
    id: "nhl",
    name: "Hockey",
    short: "NHL",
    league: "NHL",
    headline: ["Break the", "Ice"],
    tagline: "Line deployment, power-play units and goalie starts that swing a week.",
    atmosphere: "Cold air. Ice-blue glare. Steel on frozen glass.",
    themeName: "Glacier Cyan",
    hex: { accent: "#3fd8ff", accent2: "#b4f2ff", deep: "#021522" },
    period: "per game",
    positions: ["C", "LW", "RW", "D", "G"],
    scoring: [
      { key: "g", label: "Goal", defaultPoints: 3, min: 0, max: 5, step: 0.5 },
      { key: "a", label: "Assist", defaultPoints: 2, min: 0, max: 4, step: 0.5 },
      { key: "ppp", label: "Power-play point", defaultPoints: 0.5, min: 0, max: 2, step: 0.5 },
      { key: "sog", label: "Shot on goal", defaultPoints: 0.4, min: 0, max: 1, step: 0.1 },
      { key: "sv", label: "Save (goalie)", defaultPoints: 0.2, min: 0, max: 1, step: 0.1 },
      { key: "ga", label: "Goal against (goalie)", defaultPoints: -1, min: -3, max: 0, step: 0.5 },
    ],
    roster: [
      { key: "c", label: "Center", defaultCount: 2, max: 4 },
      { key: "w", label: "Wing", defaultCount: 4, max: 6 },
      { key: "d", label: "Defense", defaultCount: 4, max: 6 },
      { key: "g", label: "Goalie", defaultCount: 2, max: 3 },
      { key: "bn", label: "Bench", defaultCount: 4, max: 8 },
    ],
  },
  euroleague: {
    id: "euroleague",
    name: "EuroLeague",
    short: "EL",
    league: "EuroLeague",
    headline: ["Conquer", "Europe"],
    tagline: "Double-round weeks, deep rotations and the continent's loudest arenas.",
    atmosphere: "Smoke, flares and violet light from Belgrade to Madrid.",
    themeName: "Electric Violet",
    hex: { accent: "#a35cff", accent2: "#e19bff", deep: "#100626" },
    period: "per round",
    positions: ["G", "F", "C"],
    scoring: [
      { key: "pts", label: "Points", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "reb", label: "Rebounds", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "ast", label: "Assists", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "stl", label: "Steals", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "blk", label: "Blocks", defaultPoints: 1, min: 0, max: 3, step: 0.5 },
      { key: "fd", label: "Fouls drawn", defaultPoints: 1, min: 0, max: 2, step: 0.5 },
    ],
    roster: [
      { key: "g", label: "Guard", defaultCount: 4, max: 5 },
      { key: "f", label: "Forward", defaultCount: 4, max: 5 },
      { key: "c", label: "Center", defaultCount: 2, max: 3 },
    ],
  },
};

export const SPORT_LIST: Sport[] = SPORT_IDS.map((id) => SPORTS[id]);

export const DEFAULT_SPORT: SportId = "nba";

export function isSportId(v: unknown): v is SportId {
  return typeof v === "string" && (SPORT_IDS as readonly string[]).includes(v);
}

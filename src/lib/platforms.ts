import type { SportId } from "./sports";

/**
 * Fantasy platforms UniFantasy plans to support. Batch 1 contains no
 * integrations: every platform is "planned", nothing connects, and no
 * credentials are collected. Names are plain text labels (no logos/branding).
 */
export type Platform = {
  id: string;
  name: string;
  sports: SportId[];
  method: "OAuth" | "League ID" | "Account link";
  status: "planned";
};

export const PLATFORMS: Platform[] = [
  { id: "espn", name: "ESPN Fantasy", sports: ["nba", "nfl", "mlb", "nhl"], method: "Account link", status: "planned" },
  { id: "yahoo", name: "Yahoo Fantasy", sports: ["nba", "nfl", "mlb", "nhl"], method: "OAuth", status: "planned" },
  { id: "sleeper", name: "Sleeper", sports: ["nba", "nfl"], method: "League ID", status: "planned" },
  { id: "nflfantasy", name: "NFL Fantasy", sports: ["nfl"], method: "Account link", status: "planned" },
  { id: "fpl", name: "Fantasy Premier League", sports: ["soccer"], method: "League ID", status: "planned" },
  { id: "fantrax", name: "Fantrax", sports: ["nba", "nfl", "soccer", "mlb", "nhl"], method: "Account link", status: "planned" },
  { id: "cbs", name: "CBS Fantasy", sports: ["nfl", "mlb", "nba"], method: "Account link", status: "planned" },
  { id: "elfantasy", name: "EuroLeague Fantasy Challenge", sports: ["euroleague"], method: "Account link", status: "planned" },
];

export function platformsFor(sport: SportId) {
  return PLATFORMS.filter((p) => p.sports.includes(sport));
}

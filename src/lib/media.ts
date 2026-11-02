import type { SportId } from "./sports";

/**
 * Photography slots.
 *
 * Batch 1 ships with no athlete photography: none was supplied and stock or
 * scraped images can't be used without a licence. Each sport scene renders a
 * lit SVG composition instead. To add photography later, drop a licensed
 * image into /public/media/<sport>/ and fill in the entry below — the scene
 * will layer it in with the theme's colour grading automatically.
 */
export type SportMedia = {
  /** path under /public, e.g. "/media/nba/hero.jpg" */
  hero?: string;
  /** focal point for object-position, e.g. "70% 30%" */
  focus?: string;
  /** required when hero is set */
  credit?: string;
  alt?: string;
};

export const SPORT_MEDIA: Record<SportId, SportMedia> = {
  nba: {},
  nfl: {},
  soccer: {},
  mlb: {},
  nhl: {},
  euroleague: {},
};

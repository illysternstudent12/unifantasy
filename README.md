# UniFantasy

An immersive multi-sport fantasy platform for NBA, NFL, Soccer/FPL, MLB, NHL and EuroLeague.

- **Batch 1:** experience foundation — design system, six sport themes, navigation, seven screens.
- **Batch 2:** Sport Universes — six immersive environments plus an "All Sports" universe, universe-aware switching and terminology, particles, tilt interactions, cinematic universe transitions.

There is still **no** authentication, APIs, database, live sports data, platform integrations or prediction models. Every empty or preview state in the app is labelled as one.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Stack: Next.js 16 (App Router, Turbopack), React 19.3, TypeScript, plain CSS design tokens, `lucide-react` icons, and `next/font` (Anton, Manrope, JetBrains Mono).

## Screens

| Route | Screen | What works now |
| --- | --- | --- |
| `/universe` | All Sports universe | Six universe portals, rulebook comparison table, terminology dictionary |
| `/universe/[sport]` | Sport universe ×6 | Arena environment, rulebook facts at layered depths, terminology & positions, default scoring, prev/next universe |
| `/` | Dashboard | Cinematic hero, sport reel, season board (empty states), six-sport poster rail, feature editorial |
| `/leagues` | My Leagues | Sport filter, empty state, league formats |
| `/players` | Player Intelligence | Search UI (says no data yet), position filters, profile layout preview |
| `/strategy` | Strategy Lab | Live scoring builder, stat-line calculator, roster construction (pure arithmetic, no projections) |
| `/copilot` | AI Copilot | Chat UI with per-sport prompts; replies say the engine isn't connected |
| `/connections` | Platform Connections | Planned platforms by sport; connect buttons disabled, no credentials collected |
| `/settings` | Settings | Home theme, followed sports, motion (system/reduced/full), parallax, grain, sidebar; saved to localStorage |

## Architecture

```
src/
  app/                    routes (each page wraps content in <PageTransition>)
  components/
    shell/                AppShell, sidebar, top bar, bottom nav, sheets, sport switcher, PrefsSync
    art/                  SportBall (per-sport SVG hero objects), FieldLines, SportScene
    ui/                   primitives (Reveal, Button, Chip, PreviewTag, SectionHead), PageHero
    home|leagues|players|strategy|copilot|connections|settings/   screen views
  lib/
    sports.ts             sport registry: themes, copy, positions, scoring and roster defaults
    preferences.ts        sport + preference stores, reduced motion, switchSport()
    store.ts              tiny persisted store (useSyncExternalStore + localStorage)
    motion.ts             shared IntersectionObserver reveals and rAF parallax
    nav.ts, platforms.ts, media.ts
  styles/
    tokens.css            brand tokens + per-sport tokens keyed by [data-sport]
    base.css              type, atmosphere, grain, reveals, view transitions, reduced motion
    shell.css, components.css, pages.css
```

### Sport theming

- Each sport's palette is a set of CSS custom properties under `[data-sport="…"]` in `tokens.css`. They're registered with `@property`, so colours animate when the sport changes.
- `data-sport` sits on `<html>` for the app-wide theme. It can also go on any element to scope a theme locally, which is how the home poster rail shows all six at once.
- An inline boot script applies the stored sport, motion and grain settings before first paint, so there is no flash of the default theme.
- `switchSport()` uses the View Transitions API to reveal the new theme in a circle from the click point. It falls back to the animated token blend, or to an instant swap when motion is reduced.

**Adding a sport:** add an entry to `SPORTS` in `lib/sports.ts`; terms, positions, rules and format in `lib/universe.ts`; a token block in `tokens.css`; a hero object in `SportBall.tsx`; a surface in `FieldLines.tsx`; a landmark in `ArenaBackdrop.tsx`; and a particle kind in `Particles.tsx`.

### Universes (Batch 2)

- **Selection** = one of six sports or `"all"` (`lib/universe.ts`). `useUniverse()` returns `{ selection, sport | null, meta }`; `meta` carries copy, theme name and **terminology** (lineup / roster / matchup / moves / period — e.g. Soccer says *Starting XI, Squad, Fixture, Transfers, Gameweek*).
- **Switching:** always go through `useSwitchUniverse()`. On `/universe/*` the URL is the source of truth, so it navigates (with a zoom-through `universe` view transition) and the page syncs the global theme; elsewhere it re-themes in place with the circular reveal. The choice persists in localStorage.
- **All Sports:** gold "Championship" theme over a prism atmosphere; pages that need one concrete sport (Players, Strategy Lab) show an in-page `SportPicker` whose section is scoped with `data-sport`.
- **Environments:** `ArenaBackdrop` draws a crowd bowl, roof rig or floodlights and a sport landmark (hoop + scoreboard, goalposts, goal + floodlights, light banks + foul pole, boards + net + banners, smoke + flares). `Particles` adds embers / sparks / snow / drizzle / dust / motes / prism. Both are deterministic (`lib/seeded.ts`) so server and client render identically.
- **Rulebook facts** (`RULES`, `FORMAT`) are fixed competition rules — game length, players per side — and are labelled "not statistics". No analytics are shown anywhere.
- **Performance:** offscreen posters/portals mount their scenes lazily (`useInView`), sections use `content-visibility: auto`, and there are still no raster images to load.

### Motion and accessibility

- Route changes use React `<ViewTransition>`: pages lift out and rise in, and Back slides sideways. The shell chrome stays put during transitions.
- Scroll reveals and parallax share one observer and one rAF loop.
- Reduced motion follows the OS setting unless overridden in Settings, and it disables animations, transitions, parallax, particles, tilt and view-transition motion.
- The app includes a skip link, visible focus rings, `aria-current` on navigation, labelled radio groups and switches, focus-managed bottom sheets that close on Escape, and live regions for results.

### Photography

No athlete photography ships in Batch 1. None was supplied, and stock or scraped images can't be used without a licence. Each sport instead gets a lit SVG scene: a hero object with rim lighting over a perspective court, field, pitch, diamond or rink.

To add licensed photos, put them in `public/media/<sport>/` and fill in `src/lib/media.ts`. The scene layers the photo in under the theme's colour grading.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal site for William Manzoli (manzoli.dev). Single-page Nuxt 3 app deployed to Vercel Edge.

## Commands

- `yarn dev` — start Nuxt dev server
- `yarn build` — production build
- `yarn generate` — static prerender
- `yarn preview` — preview the built app

Package manager is **Yarn** (a `yarn.lock` is committed; `package-lock.json` was deleted intentionally). No test runner or linter is configured.

## Architecture

The whole UI lives in `app.vue` — there are no Nuxt pages or routes. It renders a single full-viewport card with two halves:

- **Left half**: a `PrismaticBurst` WebGL backdrop with a `VariableProximity` headline that swaps per section.
- **Right half**: one of three sections (`SectionAbout`, `SectionStack`, `SectionWork`), chosen by `currentIndex` from `useSectionNav`.

Navigation between sections is driven by `composables/useSectionNav.ts`, which binds wheel, keyboard (arrows/PageUp-Down/Home/End), and touch swipe handlers to the root `<main>` element. Wheel events are debounced with a 700ms lock. `useReducedMotion` short-circuits animated components (PrismaticBurst, VariableProximity) when the user prefers reduced motion — keep that branch intact when adding motion.

`isDark` is `currentIndex === 2` (the Work section). Color tokens come from Tailwind theme extensions in `tailwind.config.ts`: `page`, `paper`, `ink`, `rule`, `muted`. The font stack (`serif` Newsreader, `sans` Inter, `mono` JetBrains Mono) is loaded via Google Fonts in `nuxt.config.ts` head.

### Components layout (auto-import)

`nuxt.config.ts` registers three component dirs with `pathPrefix: false`, so files are imported by basename without a folder prefix:

- `~/components/vb` — vendored Vue Bits components fetched via `jsrepo` (see `jsrepo.config.mts`, registry `https://vue-bits.dev/r`). Treat these as third-party: prefer re-fetching with `jsrepo` over editing in place.
- `~/components/sections` — the three swappable right-pane sections.
- `~/components` — shared primitives (`NavPagination`, `Pill`, `SectionTitle`, `SectionEyebrow`).

### Data

`utils/sections.ts` is the single source of truth for the stack icons, company list, and contact links. It imports `public/profile.json` at build time, so changes to either propagate to every section. Icons referenced by `stack`/`companies` must exist under `public/icons/` (and `public/icons/dark/` for company logos).

### Deployment

`nitro.preset: 'vercel-edge'` in `nuxt.config.ts` targets Vercel's edge runtime. Note: the session-level Vercel guidance recommends Fluid Compute (regular Node) over Edge Functions — if compatibility issues arise, switching the preset is the lever.

## Conventions

- Indentation in this repo is inconsistent across files (some 2-space, some 4-space, some tabs). Match the file you're editing rather than reformatting.
- Animations and heavy WebGL components must be wrapped in `<ClientOnly>` and gated by `useReducedMotion` — see `app.vue` for the pattern.

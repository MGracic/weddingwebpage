# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Bilingual (Croatian/English) wedding website for Tea & Mak (30 May 2026). Static Astro site, deployed as plain HTML. The high-level architecture rationale lives in `weeding_webpage.md` (note typo in filename).

## Commands

```bash
npm run dev      # local dev server (astro dev)
npm run build    # production build → dist/
npm run preview  # serve built site
```

There are no tests, linter, or formatter configured.

## Architecture

### Stack
- **Astro 6** with built-in i18n routing (`astro.config.mjs`). `defaultLocale: "hr"` with `prefixDefaultLocale: false` — Croatian lives at `/`, English at `/en/`.
- **Tailwind CSS v4** via the Vite plugin (`@tailwindcss/vite`). Theme colors and fonts are declared in `src/styles/global.css` under `@theme {}` (custom palette: `bronze`, `sage`, `ivory`, `cream`, `warm`, `charcoal` + light variants). Use these semantic names rather than raw hex.
- TypeScript with `@/*` path alias → `src/*` (`tsconfig.json`).

### i18n is the load-bearing concept

Three things must stay in sync — adding a page or nav item touches all of them:

1. **`src/i18n/ui.ts`** — single source of truth. Defines:
   - `routes[lang][routeKey]` — the URL path for each route in each language. Croatian and English paths are *different words* (e.g. `our-story` → `/nasa-prica` vs `/en/our-story`), not just prefixed.
   - `sections[routeKey].enabled` — feature flag that gates whether the route appears in the nav. Disabling here hides it from `Nav.astro` without deleting the page.
   - `ui[lang][key]` — flat translation dictionary. Lookup falls back: requested lang → default lang (`hr`) → the key string itself.

2. **`src/pages/<croatian-slug>.astro`** and **`src/pages/en/<english-slug>.astro`** — Astro file-based routing means each page exists *twice*, once per locale. The two files share layouts/components but have separate `.astro` files.

3. **`src/i18n/utils.ts`** — helpers used everywhere:
   - `getLangFromUrl(Astro.url)` — detects `hr` vs `en` from the URL prefix.
   - `useTranslations(lang)` returns a `t(key)` function.
   - `getLocalizedPath(routeKey, lang)` — always use this for internal links, never hardcode paths, so Croatian/English slug pairs stay correct.
   - `getAlternateLanguagePath(url)` — powers the language toggle.

When adding a new section: add its translations to both `ui.hr` and `ui.en`, add the route to both `routes.hr` and `routes.en`, add it to `sections` (default `enabled: false` if WIP), create both page files, and `Nav.astro`'s `navItems` array will pick it up automatically.

### Components

`src/layouts/Layout.astro` is the only layout — wraps every page with `<Nav>`, `<Footer>`, fonts (Playfair Display + Lora from Google Fonts), and `<meta name="robots" content="noindex, nofollow">` (site is unlisted by design).

`Nav.astro` filters its menu through `sections[key]?.enabled` — toggling a section off in `ui.ts` is the supported way to hide a route.

### RSVP form (`src/components/RsvpForm.astro`)

Submits to a Google Apps Script Web App via `fetch` with `mode: "no-cors"` and `application/x-www-form-urlencoded`. The endpoint URL is hardcoded as `APPS_SCRIPT_URL` in the inline `<script>`. Because of `no-cors`, the response is opaque — success is assumed if `fetch` doesn't throw.

Notable patterns:
- Translation strings used inside the client-side `<script>` are passed via `data-t-*` attributes on the `<form>` element (the script reads `form.dataset.tFoo`), because `useTranslations` only runs at build time in the frontmatter.
- Progressive disclosure: `#attending-fields` is hidden until `attending=yes` is selected.
- Additional guests are dynamic DOM — built via `innerHTML` with named inputs `guest_<n>_name` / `guest_<n>_dietary`, then collected into a `guests` JSON array at submit time and sent alongside scalar fields.

## Conventions

- All user-facing strings go through `t("…")`. Don't hardcode Croatian or English text in components.
- All internal links use `getLocalizedPath(routeKey, lang)`. Don't hardcode `/nasa-prica` or `/en/our-story`.
- Croatian special characters (č, ć, đ, š, ž) must render — verify any new font supports Latin Extended-A.
- The site is intentionally `noindex, nofollow`. Don't add SEO scaffolding.

# AGENTS.md — ruthsmarriage


## Project
**1:1 port** of **ruthsmarriage.com** (marriage counselling and coaching; WordPress + Hello Elementor + Elementor Pro + JetEngine) to **Astro on Cloudflare Workers**. The design must stay **pixel-identical** at 1440/1024/390. This is not a redesign.
The plan lives at `~/Projects/ruthsmarriage/migration-plan/` (`$PLAN`). Read `$PLAN/README.md` and `$PLAN/00-site-audit.md` before any work. The visual and content reference is in `discovery/`.


## ⏩ Current focus (2026-10-22): visual track
Work only from `migration-plan/VISUAL-TRACK.md` until the human signs off **G2b**. Start with `migration-plan/reviews/G2-home-2026-10-22.md` (item 1: `@fontsource` imports must be at the top of `tokens.css`; no web fonts load today). Verify every change with `pnpm qa:visual -- --pages <keys>` (`scripts/qa/visual-compare.mjs`). **No deploy, Cloudflare, DNS or Resend work** until G2b. `dev.local` holds a secret: it's git-ignored, so never commit it or print its contents.

## Stack
- Astro (`output: "server"`), `@astrojs/cloudflare`, `@astrojs/react` (the card/header/footer components are React)
- **No CMS.** All content is JSON in `src/data/`; all images are local files in `public/assets/`
- pnpm, TypeScript strict
- Plain CSS with custom properties named after the Elementor kit globals (`src/styles/tokens.css`). No Tailwind. Fonts: Nunito + Poppins via `@fontsource`. Carousels: Swiper.

## Content model
- `src/data/*.json` — one file per collection (`settings`, `menus`, `banners`, `marquee`, `services`, `resources`, `testimonials`, `posts`, `pages`, `taxonomies`). Types in `src/data/types.ts`; accessors in `src/data/index.ts`.
- Images are `{ src: "/assets/media/…", alt }` — always local paths under `public/`.
- `seed/seed.json` is the **source of truth** captured from WordPress. `pnpm data:build` (`scripts/reference/build-data.mjs`) regenerates `src/data/*.json` and copies the referenced media from `discovery/media/` into `public/assets/media/`. **Edit `seed/seed.json` (or the build script) and re-run it — never hand-edit `src/data/*.json`.**
- Taxonomy terms live on each entry as `terms: { category: [{slug,label}], … }`; `src/data/index.ts` exposes `getTerm`, `postsInCategory`, `postsWithTag`.

## Rules
1. **Fidelity beats taste.** `migration-plan/page-maps/` is the 1:1 spec for every page (written by Claude from live measurements); it wins over every other source. Fill gaps from `discovery/specs/raw/` and `discovery/raw/css/post-*.css`. If a map is ambiguous, ask rather than guess. Don't "improve" spacing, colour, copy or layout. Deviations need the human's approval and a note in the report.
2. Never write to the live WordPress site. Scrape at ≤ 2 req/s.
3. Don't invent content (copy, prices, links, testimonials). Use `TODO(G3)` markers.
4. Stop and ask the human at gates G1–G5 (see `$PLAN/README.md`).
5. Each phase ends with: acceptance checks run → `$PLAN/progress/phase-NN-report.md` written → `git commit -m "phase-NN: …"`.
6. Secrets (`.env`, Cloudflare tokens) never get committed. `discovery/raw/` and `discovery/media/` are git-ignored.
7. Keep components small and readable; no dead code; no `elementor-*` class names in the new markup.
8. **No nested `<a>`.** A card that is entirely clickable must be a `<div>`/`<article>` with a stretched title link (`::after { inset: 0 }`), not an `<a>` wrapping other links — the browser tears the markup apart and the card loses its styling.

## Cloudflare traps (field notes from previous builds)
1. **Dev server and Vite cache.** `pnpm dev` may return immediately and keep running in the background. After a dependency install, an `astro.config` edit, or odd island errors (`_jsxDEV is not a function`, 404s on `deps/…?v=`): `pnpm astro dev stop && rm -rf node_modules/.vite && pnpm dev`. A hot-reloaded dev server isn't proof that something works.
2. **Deploy = `pnpm build && pnpm wrangler deploy --config dist/server/wrangler.json`, always together.** The Astro Cloudflare adapter writes a complete deploy config to `dist/server/wrangler.json`; the project `wrangler.jsonc` only carries `name`, `compatibility_*` and the `ASSETS` binding. `main` must stay `@astrojs/cloudflare/entrypoints/server` — pointing it at `dist/server/entry.mjs` fails the build (the file does not exist yet when the config is resolved).
3. **Secrets belong to one Worker.** Never rename or delete/recreate the `ruthsmarriage` Worker.
4. **Wrangler in non-interactive shells:** use `--yes`/`--force` where supported, set `CLOUDFLARE_ACCOUNT_ID`, and verify every create/delete with a `list`.
5. **Forms:** Astro form parsing sends `null` for empty optional fields, so use `.nullish()`. Turnstile won't issue tokens to headless Chromium: test captcha in a real browser and use the always-pass keys in automation.

## Commands
- `pnpm dev`: local dev (port 4321); stop with `pnpm astro dev stop`
- `pnpm build && pnpm preview`: production build check
- `pnpm deploy`: build + deploy to the `ruthsmarriage` Worker
- `pnpm data:build`: regenerate `src/data/*.json` + `public/assets/media/` from `seed/seed.json`
- `pnpm test`: vitest (data layer)
- `pnpm typecheck`: `astro check` — must be 0 errors
- `pnpm qa:visual`, `pnpm qa:links`, `pnpm qa:urls`, `pnpm qa:a11y`: Phase 8 checks (all take `--base`)

## Key files
- `astro.config.mjs` (adapter + React), `wrangler.jsonc` (Worker config), `src/layouts/Base.astro` (header/footer shell), `src/layouts/Canvas.astro` (bare shell), `src/components/` (React cards + Astro sections), `src/pages/` (all server-rendered), `src/data/` (JSON content), `seed/seed.json` (captured source data), `scripts/reference/` (capture + data-build tooling).

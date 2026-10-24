# V2 review: ListingRow pages (2026-10-23)

Reviewer: Claude, from `migration-plan/progress/visual-listing-rows.md`, `discovery/qa/REPORT.md` (run 2026-10-22T15:06) and the uncommitted working tree on top of `72a7dbf`.

**Status: not passed. Don't commit `visual: listing rows` yet.** The 1440 results are real, and the seed fixes are good work. But the exit gate (VISUAL-TRACK.md: every section within ±4px at 1440/1024/390, pixel diff ≤ 2%) is not met. And the pixel diff on these pages doesn't measure the listing rows at all (item 1).

## Problems with the progress file

- **The services 1024 and 390 rows are left out.** REPORT.md has them: 2/4 sections off at both widths, and the hero is off there too, not only the expected extra services.
- **It says the remaining drift is fine.** "1–72px … (< 2%)" uses page height as a percentage, which isn't the gate. The gate is ±4px per section. Out of tolerance: singles@1024, married@1024, married@390, resources@390, books@1024, books@390 (2 sections), and services@1024/390.
- **Pixel diff is over 2%** on resources@390 (2.3%) and books@390 (3.0%), plus books@1024 full-page (3.3%).

## Punch list (in order)

1. **The comparer masks the listing itself (blocker for any sign-off).** `scripts/qa/visual-compare.mjs:92` masks every `jet-listing-grid`. That's right on home (random carousels), but on these five pages the listing grid *is* the ListingRow content. As a result, all 15 list sections show **0.0%** diff in REPORT.md, even services with a +3028px section. Fix: mask `jet-listing-grid` only when it is a carousel (e.g. a swiper/slick ancestor or `data-carousel`), or take a per-page mask list. Then re-run. Expect the real row diffs to show up, and fix whatever they show.
2. **PageHero height at tablet/mobile.** On services and books, live's hero is **300px @1024 and 250px @390**. The port stays at 350 (+50 / +100, 5–8% diff). This is the "both PageHero pattern variants" part of V2's scope. Check `page-maps/_global.md` / the per-page maps for the responsive heights, and check whether singles/married/resources use the other variant (they pass, so they probably do).
3. **Row drift at 1024/390** (+20 to +33 on singles/married list sections, +51 on resources@390, −28 on books@390 after the hero fix). Once item 1 is done, use the per-section diff images to find which row grows. The likely causes are line-wrap differences in description text, or the ≤1024 text padding / ≤767 gap rules in `ListingRow.astro`.
4. **Progress file**: list all 15 rows from REPORT.md, mark every ✗ section, and only call V2 passed once the gate is met at all three widths.

## Fine as-is

- `/services/` listing all 11 services is an expected difference (VISUAL-TRACK.md rules). Only its list section should be off, and at 1440 it is.
- The section-relative mask fix in the comparer is correct: masks come from live coordinates (`maskRegions(live, …)`), so moving them by live's section y for both bands is the right thing. Keep it.
- The singles/married order discrepancy: it was checked against live and noted, as the rules ask. Accepted.
- Seed fixes (split `<p>` descriptions, kept `<br>`/`&nbsp;`, plural `format`): good. Keep them.

---

# Update (Claude, later on 2026-10-23): fixes applied, hand back to opencode

## Done (uncommitted, in the working tree)
1. **Comparer mask**: `jet-listing-grid` is now masked only when the live spec node has `carousel: true` (home's sliders). The listing pages are measured for real.
2. **PageHero**: `PageHero.tsx` set `minHeight`/`padding`/title size/wave height **inline**, so the responsive rules in `components.css` never applied. Those properties are now in CSS only (`components.css` → "PageHero"). `pattern-flat` stays 350px / 55px / padding 0 10px at every width (singles-married.md §1). All heroes pass at all widths.
3. **Fonts**: `tokens.css` was missing **Nunito 700, Poppins 600 and Poppins 400 italic** (titles rendered as 800, format/audience lines as faux bold/italic). Added; the comparer preloads them too.
4. **ListingRow responsive rules**: rewritten from live's template CSS (`/wp-content/uploads/elementor/css/post-{149,153,301,305,724,728}.css`):
   - 149 (service B) ≤1024: container `80px 50px 70px` (bottom is 70, not 80).
   - 301/305/724/728 (resource + book) ≤767: text column 20px on A and B; B container `50px 20px`; B image column padding 0.
5. **Live reference refreshed for singles, married, resources only.** The Oct 16 1024/390 captures were noisy (same content, heights 6–67px off), and the new capture agrees with a row-by-row probe. **Do NOT recapture books or services**: live changed there (services lists more items; books row 1 "50 Intimate Conversations" is visibly broken on live at 1024: text column squeezed to 184px). Keep the Oct 16 reference for those two.
6. New tool **`scripts/qa/probe-rows.mjs <path> <width> [row]`**: per-row height delta live vs local, or every leaf box in one row. It applies capture.mjs's font CORS fix to live (live's web fonts fail to load without it, so comparing to raw live is meaningless).

typecheck 0 errors, tests 7/7.

## Comparer now (`--pages services,singles,married,resources,books`)
| Page | 1440 | 1024 | 390 |
|---|---|---|---|
| services | 1/4 (expected: all 11 services) | 1/4 (expected) | 1/4 (expected) |
| singles | ✓ 2.8% | ✗ −22 (row 1), 8.9% | ✓ 1.2% |
| married | ✓ 5.5% | ✓ 4.7% | ✓ 1.6% |
| resources | ✓ 4.0% | ✓ 5.3% | ✓ 2.3% |
| books | ✓ 2.4% | ✗ +10, 4.3% | ✗ +26, 7.7% |

Heights are nearly done. The pixel diff (gate ≤2%) is not.

## Your tasks, in order
1. **Use live's exact font files.** Singles @1024 row 1: same text, same 542px column, but live wraps to 5 lines and the port to 4. The `@fontsource` builds differ in metrics from the Google Fonts copies Elementor self-hosts. Download the woff2 files referenced by `https://www.ruthsmarriage.com/wp-content/uploads/elementor/google-fonts/css/{nunito,poppins,roboto}.css` (rewrite the apex host to `www`, latin subset, only the weights/styles in `tokens.css`) into `public/fonts/`, declare them with `@font-face` in `tokens.css` (keep `font-display: swap`), and remove the `@fontsource` imports. Check: `probe-rows.mjs /singles/ 1024` shows row 1 Δh 0. Then re-run `--pages home` to make sure home didn't move.
2. **Books @1024 (+10) and @390 (+26)**: compare against the Oct 16 reference (`discovery/specs/raw/books-*.json` + screenshot), not current live (row 1 is broken there). Rows 0 and 2 can still be probed against live.
3. **Pixel diff to ≤2%** on singles/married/resources/books at all widths. Open each `discovery/qa/<page>-<w>-diff.png` and fix what's red. Known items: on resources/books the **title is wrapped in a link** to the detail page on live (an `<a>` around the `h2`); the port's title isn't a link. Add it with no visual change (inherit colour, no underline).
4. **Images**: `ListingRow` `<img loading="lazy">` has no `width`/`height`, so each one is 0px tall until it loads (layout shift, and it breaks measurements that don't scroll first). Add intrinsic `width`/`height` (read them at build time in `build-seed.mjs`, or store them in the data).
5. **Tool bug**: `capture.mjs` does `join(root, arg("shots"/"specs"))`, so an absolute `--shots`/`--specs` path gets nested inside the repo. Use `resolve(root, …)`.
6. When the gate is met: rewrite `progress/visual-listing-rows.md` with **all 15 rows** from REPORT.md (mark services as the expected difference, note the books/services reference decision from item 5 above), then commit `visual: listing rows`.

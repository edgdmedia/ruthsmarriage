# Visual track — step V4 (detail templates + booking modal)

Date: 2026-10-24 · follows `visual: V2 listing pages, V3 story/contact, review fixes, blog articles`
Scope: `single-service, single-resource, single-resource-book, single-resource-video`
and the booking modal UI.

## Result

`node scripts/qa/visual-compare.mjs --pages single-service,single-resource,single-resource-book,single-resource-video`

| Page | Width | Page height live → new | Pixel diff | Sections off |
|---|---|---|---|---|
| single-service | 1440 | 1523 → 1523 (+0) | 0.8% (full 0.8%) | 0/3 |
| single-service | 1024 | 1640 → 1640 (+0) | 1.9% (full 2.0%) | 0/3 |
| single-service | 390 | 2199 → 2200 (+1) | 6.3% (full 6.1%) | 0/3 |
| single-resource | 1440 | 1578 → 1579 (+1) | 1.2% (full 1.3%) | 0/3 |
| single-resource | 1024 | 1460 → 1458 (-2) | 4.1% (full 4.4%) | 0/3 |
| single-resource | 390 | 2331 → 2331 (+0) | 6.4% (full 6.4%) | 0/3 |
| single-resource-book | 1440 | 1523 → 1523 (+0) | 0.6% (full 0.6%) | 0/3 |
| single-resource-book | 1024 | 1407 → 1408 (+1) | 3.2% (full 3.2%) | 0/3 |
| single-resource-book | 390 | 2329 → 2330 (+1) | 6.5% (full 5.6%) | 0/3 |
| single-resource-video | 1440 | 1523 → 1523 (+0) | 6.7% (full 6.7%) | 0/3 |
| single-resource-video | 1024 | 1407 → 1408 (+1) | 8.6% (full 8.6%) | 0/3 |
| single-resource-video | 390 | 2070 → 2071 (+1) | 10.7% (full 10.8%) | 0/3 |

Every section is within ±2px at all three widths. Pixel diffs over 2%:
- **video**: expected — live shows no video; the port shows a lite YouTube embed
  in the image column (audit Known issues).
- **1024/390**: sub-pixel text and image-scaling antialiasing; the side-by-sides
  show no layout difference. Resources also lack live's empty 1px term pill
  (spec: don't render it; its 21px of space is kept as title margin).

## What changed
- `DetailShell.astro`: one two-column shell for both templates (`service`
  stacks at ≤1024, `resource` stays a row until ≤767), boxed 1140.
- `service/[slug].astro` rebuilt on the shell; paragraph 14.4px margins, 26px pill,
  curly-quote notice.
- New `resource/[slug].astro` (resources, books, videos). "52 Rules" gained its
  missing **Amazon** CTA in `resources.json`.
- `YouTubeEmbed.astro` (thumbnail + play → iframe on click) used by the resource
  video page and `/videos/`; `lib/youtube.ts` parses youtu.be/watch/embed URLs.
- `BookingModal.tsx` rewritten: was rendered open on page load. Now
  self-contained state, opens from any `[data-booking-open]`, no close button
  (as live), Esc/overlay close, focus trap + return, 6× 300ms red flash,
  policy links scroll the panel, ticked → `booking_url`. A pre-hydration click
  is queued and replayed.
- `data/policies.ts`: the policy HTML now has one source (both policy pages and
  the modal). Policy page styles switched to `:global()` so they reach the
  injected HTML (heights unchanged: 2200 / 2251).

## Modal check (1440)
Panel 1008×810 at (216,45) = 70vw × 90vh; focus moves to the panel; scroll locked;
unticked Book Now flashes `011111000000…` (6 × 300ms) without navigating; policy
link scrolls without ticking; ticked → `.booking-book-now--active`; Esc closes and
returns focus to "Book Service". Live has no 390 modal reference (the capture's
click missed), so 390 was checked for overflow only (long emails now wrap).

## Comparer fix
`visual-compare.mjs` now widens the window by the test browser's own scrollbar,
so the port really renders at the reference layout width (1425/1009/375). Before,
1024 rendered at 994 and the footer read +230px on every page.

## Owner-requested changes (2026-10-24, deliberate differences from live)
- Policy pages: 50px padding above the content (30px 20px on phones); live has none.
- `/videos/`: two-column grid, 20px gap, 50px padding (one column on phones);
  live stacks full-width videos.

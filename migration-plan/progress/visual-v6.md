# Visual track — step V6 (media pages + Ask Coach form UI)

Date: 2026-10-24.
Scope: `videos, sponsored, announcements, event, askcoach`.

## Result
`node scripts/qa/visual-compare.mjs --pages askcoach`

| Page | Width | Page height live → new | Pixel diff | Sections off |
|---|---|---|---|---|
| askcoach | 1440 | 900 → 900 (+0) | 2.7% | 0/1 |
| askcoach | 1024 | 768 → 768 (+0) | 4.4% | 0/1 |
| askcoach | 390 | 844 → 844 (+0) | 12.2% | 0/1 |

The 390 diff is the Turnstile placeholder (60px + 31px gap), which shifts the
vertically centred stack; the page map expects this until G3.

## What changed
- `Canvas.astro` now loads the site stylesheets and favicons: /askcoach/ had no
  fonts (system fallback) and the browser's 8px body margin.
- Ask Coach spacing to spec: divider 15px either side, 12px under labels, 31px
  between fields; Elementor caret on the select; Send full width ≤767.
- Form UI states (no sending yet, G3): the question is required; the result
  message replaces the Send button, previewable with `?state=success` /
  `?state=error` (Elementor success/danger colours).
- Videos (two columns) and Sponsored / Announcements / Event Gallery (empty
  state) were changed earlier at the owner's request; they now also use the
  unified page header (see visual-v5.md).

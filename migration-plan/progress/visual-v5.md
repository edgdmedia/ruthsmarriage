# Visual track — step V5 (blog + theme-default pages)

Date: 2026-10-24 · commits `4ccf7fa` and the "unified headers" commit after it.
Scope: `inspired-features, single-post, category, tag, service-type, resource-type,
search, 404, freebies, privacy-policy, cancellation-policy, confidentiality-policy`.

## Owner-approved differences from live (don't "fix" these back)
- **Page headers, every page**: one design (`WaveHero.astro` / `PageHero.tsx`,
  components.css "Page header"): plum band, left-aligned Nunito 800 title, wave
  edge. Pages with a header photo keep it under a plum gradient; the rest tile the
  pink circles pattern. The comparer flags the header section on nearly every page.
- **Single post**: redesigned — cover straddling the hero, reading column +
  `BlogSidebar`, tag pills, "Want to talk this through?" panel, "Keep reading".
- **Search and archives** (category, tag, service type, resource type): one
  listing — `ListingHero` + `ResultList` (cards, highlighted matches on search,
  numbered paging, empty state). Search adds type filters. URLs stay WordPress
  shaped: `/?s=`, `/page/N/?s=`, `/category/x/page/N/`.
- Header search toggle; footer "Links" column is six plain links.
- 404 / Freebies / Privacy Policy use the shared header over Hello's content column.

## Content fix
Blog post bodies were truncated to 600 chars of plain text by build-seed. Full
cleaned HTML now comes from the Phase 1 dump (`scripts/reference/post-html.mjs`,
`fill-post-content.mjs`); four images missing on live too were dropped.

## Open
- Privacy Policy is ~835px shorter than live at 1440 (content check pending).

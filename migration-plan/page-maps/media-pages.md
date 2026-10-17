# Sponsored `/sponsored/` (page 45), Announcements `/announcements/` (page 47), Event Gallery `/event/` (page 49)

All three are **hero-only placeholder pages** on live: a hero, then the footer, with no body content. Port them as-is. If an editor adds `content`, render it below the hero in the generic page body (`default-pages.md`), so the pages are ready when Ruth adds content.

| Page | Hero | 1440 | 1024 | 390 | Page h (1440/1024/390) |
|---|---|---|---|---|---|
| Sponsored | `pattern` (component 394), **boxed** | 137+350 | 137+300 | 128+250 | 973 / 939 / 1476 |
| Announcements | `pattern` (page-built copy of 394) | 137+350 | 137+300 | 128+250 | 973 / 939 / 1476 |
| Event Gallery | `photo` (component 377) | 137+350 | 137+309 | 127+259 | 973 / 948 / 1485 |

## Sponsored
- `PageHero` `pattern`, title "Sponsored", **but boxed**: the hero is **1140px wide and centred** (x 143–1283 @1440), not full width. White page background shows on either side. The waves divider spans the boxed width (1335px svg at `calc(117% + 1.3px)`).
- @≤1024 the box is full width minus 10px container padding (check the screenshots `sponsored-1024.png`, `sponsored-390.png`).

## Announcements
- Visually identical to `PageHero` `pattern` (Nunito 700 55/40/35, heights 350/300/250, waves 23px), full width. Title "Announcements".

## Event Gallery
- `PageHero` `photo`, title "Event Gallery", image `2025/06/photo-output-2.jpeg`.

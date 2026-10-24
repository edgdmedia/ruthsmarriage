# Visual track — step V8 (full sweep) → G2b

Date: 2026-10-24.
`node scripts/qa/visual-compare.mjs` — all 31 pages × 1440/1024/390 (93 runs).
Every section that isn't an owner-approved change is within ±4px, except the
small items listed under "Accepted minor differences".

## How to read the numbers
Most pixel diffs are high by design: every page now has the unified page header
(owner, 2026-10-24) and several pages were redesigned at the owner's request. The
"Sections off" column counts those. What was checked is that **no other section
moved**: see the classification below.

## Classification of the off sections
| Cause | Pages | Status |
|---|---|---|
| Unified page header (first section) | every page with a hero | owner-approved |
| Redesigned bodies: single post, search, category, tag, service type, resource type, 404, Freebies, Privacy | those pages | owner-approved |
| Carousel dots +30px top gap (+20px per carousel) | home | owner-approved |
| `/services/` lists all services | services | documented (D-decision) |
| Videos in two columns | videos | owner-approved |
| Empty-state section (no live counterpart) | sponsored, announcements, event | owner-approved |
| Policy pages top padding | cancellation, confidentiality | owner-approved |
| About story/values sections (V3) | about | owner-approved ("good to go") |
| Footer −5px @390 (Links column = 6 plain links) | all @390 | owner-approved |

### Accepted minor differences
- Blog Articles grid (`ccc1aa1`) is −19…+33px vs live: card text wraps a little
  differently; the page was approved in the first review.

## Fixes made during V8
- **Comparer**: it widened the window by the test browser's scrollbar, which put
  a 1024px reference past the ≤1024 breakpoint, so Singles, Married, Resources,
  Freebies and 404 were measured with desktop styles (listing +292/+386px,
  footer +209px). It now hides its own scrollbar instead; those sections are 0px off.
- **Dead links inside blog posts**: 18 internal links 404'd (16 also 404 on live).
  Six renamed posts/resources are repointed; the rest are unlinked, text kept
  (`scripts/reference/post-html.mjs` `fixInternalLinks`, applied by
  fill-post-content and build-seed). No redirects (owner decision).

## Link crawl
63 internal pages, 71 assets: all 200. No `web.archive.org` or `/wp-content/`
links left. External links left as they are (owner, 2026-10-24), including three
that are "Not found" on live too: `links.ruthsmarriage.com/the-reconnected-couples-workbook`,
`links.ruthsmarriage.com/loversagainchallenge`, `ruthsmarriage.my.canva.site/coupleschallenge`.

## Full table
| Page | Width | Page height live → new | Pixel diff | Sections off |
|---|---|---|---|---|
| 404 | 1440 | 900 → 968 (+68) | 12.2% (full 53.4%) | 2/4 |
| 404 | 1024 | 768 → 974 (+206) | 13.6% (full 42.8%) | 2/4 |
| 404 | 390 | 1384 → 1531 (+147) | 12.6% (full 24.2%) | 3/4 |
| home | 1440 | 4519 → 4615 (+96) | 1.0% (full 3.3%) | 4/8 |
| home | 1024 | 4289 → 4390 (+101) | 1.5% (full 4.1%) | 4/8 |
| home | 390 | 5510 → 5569 (+59) | 3.2% (full 4.9%) | 4/8 |
| about | 1440 | 2092 → 2050 (-42) | 16.1% (full 24.4%) | 1/5 |
| about | 1024 | 2511 → 2527 (+16) | 20.1% (full 21.9%) | 3/5 |
| about | 390 | 4135 → 4081 (-54) | 15.8% (full 17.1%) | 4/5 |
| our-story | 1440 | 1605 → 1562 (-43) | 19.9% (full 29.5%) | 1/4 |
| our-story | 1024 | 1858 → 1846 (-12) | 17.7% (full 23.3%) | 1/4 |
| our-story | 390 | 2855 → 2797 (-58) | 14.1% (full 24.7%) | 2/4 |
| founder | 1440 | 1763 → 1720 (-43) | 17.1% (full 26.9%) | 1/4 |
| founder | 1024 | 1969 → 1956 (-13) | 15.7% (full 21.2%) | 1/4 |
| founder | 390 | 3229 → 3172 (-57) | 26.5% (full 23.5%) | 2/4 |
| singles | 1440 | 4180 → 4057 (-123) | 1.5% (full 28.0%) | 1/4 |
| singles | 1024 | 4124 → 3990 (-134) | 2.0% (full 31.3%) | 1/4 |
| singles | 390 | 7195 → 6994 (-201) | 1.3% (full 30.2%) | 2/4 |
| married | 1440 | 4577 → 4455 (-122) | 1.7% (full 28.3%) | 1/4 |
| married | 1024 | 4479 → 4346 (-133) | 1.8% (full 31.3%) | 1/4 |
| married | 390 | 7554 → 7353 (-201) | 1.2% (full 30.7%) | 2/4 |
| services | 1440 | 4709 → 7615 (+2906) | 29.8% (full 54.0%) | 2/4 |
| services | 1024 | 4576 → 7498 (+2922) | 32.5% (full 52.2%) | 2/4 |
| services | 390 | 7849 → 12979 (+5130) | 38.7% (full 56.3%) | 3/4 |
| resources | 1440 | 6584 → 6461 (-123) | 1.5% (full 30.4%) | 1/4 |
| resources | 1024 | 5837 → 5703 (-134) | 2.2% (full 37.2%) | 1/4 |
| resources | 390 | 8243 → 8077 (-166) | 2.3% (full 43.9%) | 2/4 |
| books | 1440 | 3035 → 2912 (-123) | 6.9% (full 32.1%) | 1/4 |
| books | 1024 | 2902 → 2819 (-83) | 9.2% (full 30.9%) | 1/4 |
| books | 390 | 4494 → 4395 (-99) | 21.0% (full 32.1%) | 2/4 |
| videos | 1440 | 2413 → 1265 (-1148) | 24.4% (full 38.5%) | 2/4 |
| videos | 1024 | 2169 → 1206 (-963) | 25.0% (full 37.4%) | 2/4 |
| videos | 390 | 1952 → 1834 (-118) | 22.3% (full 29.3%) | 3/4 |
| freebies | 1440 | 900 → 930 (+30) | 7.7% (full 53.9%) | 2/4 |
| freebies | 1024 | 768 → 936 (+168) | 9.6% (full 43.7%) | 2/4 |
| freebies | 390 | 1298 → 1458 (+160) | 8.3% (full 21.2%) | 3/4 |
| inspired-features | 1440 | 3872 → 3842 (-30) | 17.6% (full 26.5%) | 2/4 |
| inspired-features | 1024 | 3879 → 3848 (-31) | 22.0% (full 22.4%) | 2/4 |
| inspired-features | 390 | 8026 → 8002 (-24) | 30.0% (full 31.5%) | 3/4 |
| sponsored | 1440 | 973 → 1039 (+66) | 8.6% (full 23.0%) | 2/4 |
| sponsored | 1024 | 939 → 1045 (+106) | 5.4% (full 23.6%) | 2/4 |
| sponsored | 390 | 1476 → 1529 (+53) | 6.0% (full 15.8%) | 3/4 |
| announcements | 1440 | 973 → 1039 (+66) | 5.3% (full 22.3%) | 2/4 |
| announcements | 1024 | 939 → 1045 (+106) | 5.6% (full 23.8%) | 2/4 |
| announcements | 390 | 1476 → 1529 (+53) | 6.2% (full 15.8%) | 3/4 |
| event | 1440 | 973 → 1119 (+146) | 26.7% (full 43.9%) | 2/4 |
| event | 1024 | 948 → 1125 (+177) | 26.6% (full 45.1%) | 2/4 |
| event | 390 | 1485 → 1579 (+94) | 13.9% (full 23.1%) | 3/4 |
| askcoach | 1440 | 900 → 900 (+0) | 2.7% (full 2.7%) | 0/1 |
| askcoach | 1024 | 768 → 768 (+0) | 4.4% (full 4.4%) | 0/1 |
| askcoach | 390 | 844 → 844 (+0) | 12.2% (full 12.2%) | 0/1 |
| contact | 1440 | 1325 → 1282 (-43) | 17.8% (full 27.6%) | 1/4 |
| contact | 1024 | 1324 → 1312 (-12) | 17.3% (full 20.9%) | 1/4 |
| contact | 390 | 1980 → 1923 (-57) | 12.4% (full 23.6%) | 2/4 |
| cancellation-policy | 1440 | 2325 → 2259 (-66) | 16.2% (full 20.6%) | 2/4 |
| cancellation-policy | 1024 | 2473 → 2504 (+31) | 18.9% (full 20.3%) | 2/4 |
| cancellation-policy | 390 | 4818 → 4756 (-62) | 15.6% (full 14.8%) | 2/4 |
| confidentiality-policy | 1440 | 2250 → 2207 (-43) | 14.2% (full 18.2%) | 1/4 |
| confidentiality-policy | 1024 | 2302 → 2309 (+7) | 15.3% (full 15.9%) | 2/4 |
| confidentiality-policy | 390 | 3960 → 3923 (-37) | 21.0% (full 20.3%) | 3/4 |
| privacy-policy | 1440 | 2184 → 2363 (+179) | 23.2% (full 20.9%) | 2/4 |
| privacy-policy | 1024 | 2393 → 2441 (+48) | 22.5% (full 16.2%) | 2/4 |
| privacy-policy | 390 | 4141 → 4451 (+310) | 18.3% (full 22.4%) | 3/4 |
| single-service | 1440 | 1523 → 1523 (+0) | 4.5% (full 4.5%) | 0/3 |
| single-service | 1024 | 1640 → 1640 (+0) | 4.5% (full 4.6%) | 0/3 |
| single-service | 390 | 2199 → 2196 (-3) | 11.9% (full 11.7%) | 1/3 |
| single-resource | 1440 | 1578 → 1579 (+1) | 6.8% (full 6.8%) | 0/3 |
| single-resource | 1024 | 1460 → 1458 (-2) | 10.5% (full 10.7%) | 0/3 |
| single-resource | 390 | 2331 → 2327 (-4) | 14.4% (full 14.3%) | 1/3 |
| single-resource-video | 1440 | 1523 → 1523 (+0) | 7.4% (full 7.4%) | 0/3 |
| single-resource-video | 1024 | 1407 → 1408 (+1) | 8.4% (full 8.4%) | 0/3 |
| single-resource-video | 390 | 2070 → 2066 (-4) | 10.2% (full 10.3%) | 1/3 |
| single-resource-book | 1440 | 1523 → 1523 (+0) | 5.3% (full 5.3%) | 0/3 |
| single-resource-book | 1024 | 1407 → 1408 (+1) | 7.2% (full 7.2%) | 0/3 |
| single-resource-book | 390 | 2329 → 2325 (-4) | 13.0% (full 12.8%) | 1/3 |
| service-type | 1440 | 4455 → 2419 (-2036) | 32.4% (full 50.6%) | 2/4 |
| service-type | 1024 | 4568 → 2436 (-2132) | 31.5% (full 50.0%) | 2/4 |
| service-type | 390 | 4547 → 2857 (-1690) | 16.2% (full 56.2%) | 3/4 |
| resource-type | 1440 | 2563 → 1761 (-802) | 31.1% (full 64.1%) | 2/4 |
| resource-type | 1024 | 2652 → 1778 (-874) | 30.4% (full 63.3%) | 2/4 |
| resource-type | 390 | 3090 → 2226 (-864) | 18.8% (full 56.8%) | 3/4 |
| single-post | 1440 | 3599 → 6310 (+2711) | 21.4% (full 33.4%) | 2/4 |
| single-post | 1024 | 4062 → 6693 (+2631) | 21.6% (full 32.2%) | 2/4 |
| single-post | 390 | 6778 → 10476 (+3698) | 16.6% (full 27.9%) | 3/4 |
| category | 1440 | 6876 → 3395 (-3481) | 32.8% (full 60.2%) | 2/4 |
| category | 1024 | 7208 → 3412 (-3796) | 31.3% (full 56.9%) | 2/4 |
| category | 390 | 6257 → 3993 (-2264) | 19.2% (full 58.3%) | 3/4 |
| tag | 1440 | 6852 → 3395 (-3457) | 32.9% (full 60.2%) | 2/4 |
| tag | 1024 | 7208 → 3412 (-3796) | 31.3% (full 56.9%) | 2/4 |
| tag | 390 | 6256 → 3993 (-2263) | 19.8% (full 58.3%) | 3/4 |
| search | 1440 | 6380 → 3444 (-2936) | 33.6% (full 52.3%) | 2/4 |
| search | 1024 | 6558 → 3460 (-3098) | 32.9% (full 50.7%) | 2/4 |
| search | 390 | 5919 → 4035 (-1884) | 19.1% (full 51.5%) | 3/4 |


# Visual parity report

Base: http://localhost:4321 · tolerance ±4px · 2026-10-22T12:21

| Page | Width | Page height live → new | Pixel diff | Sections off |
|---|---|---|---|---|
| home | 1440 | 4519 → 4519 (+0) | 0.3% (full 0.3%) | 0/8 |
| home | 1024 | 4289 → 4310 (+21) | 0.7% (full 1.4%) | 1/8 |
| home | 390 | 5510 → 5494 (-16) | 4.5% (full 4.8%) | 1/8 |

## home @1440

Fonts loaded on new site: Nunito, Poppins, Roboto

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.0% | ✓ |
| 5972661 | 137+920 | #0 div.heroslider 137+920 | 0 | 0 | 0.0% | ✓ |
| 1316243 | 1057+217 | #1 section.home-intro 1057+217 | 0 | 0 | 0.1% | ✓ |
| 04f860d | 1274+740 | #2 section.wave-section 1274+740 | 0 | 0 | 0.1% | ✓ |
| 1f26c99 | 2014+773 | #3 section.home-testimonials 2014+773 | 0 | 0 | 0.3% | ✓ |
| a5f2b88 | 2787+648 | #4 section.wave-section 2787+648 | 0 | 0 | 0.2% | ✓ |
| ab03957 | 3435+598 | #5 section.home-posts 3435+598 | 0 | 0 | 0.1% | ✓ |
| footer | 4034+486 | footer 4033+486 | 0 | -1 | 1.4% | ✓ |

Images: `discovery/qa/home-1440-sbs.png` (live left), `home-1440-diff.png`

## home @1024

Fonts loaded on new site: Nunito, Poppins, Roboto

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 5972661 | 137+788 | #0 div.heroslider 137+788 | 0 | 0 | 0.0% | ✓ |
| 1316243 | 925+217 | #1 section.home-intro 925+217 | 0 | 0 | 0.1% | ✓ |
| 04f860d | 1142+740 | #2 section.wave-section 1142+740 | 0 | 0 | 0.1% | ✓ |
| 1f26c99 | 1882+663 | #3 section.home-testimonials 1882+663 | 0 | 0 | 0.5% | ✓ |
| a5f2b88 | 2545+648 | #4 section.wave-section 2545+648 | 0 | 0 | 0.6% | ✓ |
| ab03957 | 3193+593 | #5 section.home-posts 3193+614 | 21 | 0 | 0.1% | ✗ |
| footer | 3787+503 | footer 3807+503 | 0 | 20 | 4.0% | ✓ |

Images: `discovery/qa/home-1024-sbs.png` (live left), `home-1024-diff.png`

## home @390

Fonts loaded on new site: Nunito, Poppins, Roboto

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| 5972661 | 128+864 | #0 div.heroslider 128+864 | 0 | 0 | 0.0% | ✓ |
| 1316243 | 992+337 | #1 section.home-intro 992+337 | 0 | 0 | 3.9% | ✓ |
| 04f860d | 1329+856 | #2 section.wave-section 1329+856 | 0 | 0 | 2.4% | ✓ |
| 1f26c99 | 2185+948 | #3 section.home-testimonials 2185+948 | 0 | 0 | 2.8% | ✓ |
| a5f2b88 | 3133+648 | #4 section.wave-section 3133+648 | 0 | 0 | 7.7% | ✓ |
| ab03957 | 3781+630 | #5 section.home-posts 3781+614 | -16 | 0 | 5.5% | ✗ |
| footer | 4411+1099 | footer 4395+1099 | 0 | -16 | 9.2% | ✓ |

Images: `discovery/qa/home-390-sbs.png` (live left), `home-390-diff.png`

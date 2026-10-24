# Visual parity report

Base: http://localhost:4321 · tolerance ±4px · 2026-10-23T15:00

| Page | Width | Page height live → new | Pixel diff | Sections off |
|---|---|---|---|---|
| services | 1440 | 4709 → 7738 (+3029) | 28.7% (full 38.0%) | 1/4 |
| services | 1024 | 4576 → 7582 (+3006) | 31.5% (full 40.5%) | 1/4 |
| services | 390 | 7849 → 13078 (+5229) | 38.1% (full 49.1%) | 1/4 |
| singles | 1440 | 4180 → 4180 (+0) | 0.4% (full 0.4%) | 0/4 |
| singles | 1024 | 4124 → 4124 (+0) | 1.3% (full 1.2%) | 0/4 |
| singles | 390 | 7195 → 7193 (-2) | 1.2% (full 5.6%) | 0/4 |
| married | 1440 | 4577 → 4578 (+1) | 2.5% (full 2.5%) | 0/4 |
| married | 1024 | 4479 → 4480 (+1) | 1.1% (full 1.1%) | 0/4 |
| married | 390 | 7554 → 7552 (-2) | 1.6% (full 6.1%) | 0/4 |
| resources | 1440 | 6584 → 6584 (+0) | 1.0% (full 1.0%) | 0/4 |
| resources | 1024 | 5837 → 5837 (+0) | 1.3% (full 1.3%) | 0/4 |
| resources | 390 | 8243 → 8241 (-2) | 2.3% (full 8.3%) | 0/4 |
| books | 1440 | 3035 → 3035 (+0) | 6.0% (full 6.0%) | 0/4 |
| books | 1024 | 2902 → 2902 (+0) | 8.3% (full 8.3%) | 0/4 |
| books | 390 | 4494 → 4494 (+0) | 20.2% (full 20.2%) | 0/4 |
| home | 1440 | 4519 → 4519 (+0) | 0.9% (full 0.9%) | 0/8 |
| home | 1024 | 4289 → 4294 (+5) | 1.3% (full 1.4%) | 1/8 |
| home | 390 | 5510 → 5510 (+0) | 2.9% (full 2.9%) | 0/8 |
| about | 1440 | 2092 → 2129 (+37) | 6.4% (full 8.3%) | 1/5 |
| about | 1024 | 2511 → 2528 (+17) | 11.5% (full 12.5%) | 2/5 |
| about | 390 | 4135 → 4220 (+85) | 13.6% (full 15.9%) | 2/5 |
| our-story | 1440 | 1605 → 1605 (+0) | 5.8% (full 5.8%) | 0/4 |
| our-story | 1024 | 1858 → 1859 (+1) | 6.6% (full 6.6%) | 0/4 |
| our-story | 390 | 2855 → 2876 (+21) | 10.0% (full 11.2%) | 1/4 |
| founder | 1440 | 1763 → 1763 (+0) | 5.8% (full 5.8%) | 0/4 |
| founder | 1024 | 1969 → 1969 (+0) | 6.7% (full 6.7%) | 0/4 |
| founder | 390 | 3229 → 3250 (+21) | 23.1% (full 23.6%) | 1/4 |
| contact | 1440 | 1325 → 1325 (+0) | 6.1% (full 3.0%) | 1/4 |
| contact | 1024 | 1324 → 1581 (+257) | 13.1% (full 28.0%) | 1/4 |
| contact | 390 | 1980 → 2726 (+746) | 16.8% (full 42.4%) | 1/4 |

## services @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 19e6f6a | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 0.9% | ✓ |
| adc6e0d | 487+3737 | #1 section.service-list 487+6765 | 3028 | 0 | 35.5% | ✗ |
| footer | 4224+486 | footer 7252+486 | 0 | 3028 | 3.6% | ✓ |

Images: `discovery/qa/services-1440-sbs.png` (live left), `services-1440-diff.png`

## services @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.4% | ✓ |
| 19e6f6a | 137+300 | #0 div.page-hero 137+300 | 0 | 0 | 0.9% | ✓ |
| adc6e0d | 437+3637 | #1 section.service-list 437+6643 | 3006 | 0 | 38.1% | ✗ |
| footer | 4074+503 | footer 7080+503 | 0 | 3006 | 9.9% | ✓ |

Images: `discovery/qa/services-1024-sbs.png` (live left), `services-1024-diff.png`

## services @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 5.2% | ✓ |
| 19e6f6a | 128+250 | #0 div.page-hero 128+250 | 0 | 0 | 2.8% | ✓ |
| adc6e0d | 378+6373 | #1 section.service-list 378+11601 | 5228 | 0 | 45.0% | ✗ |
| footer | 6750+1099 | footer 11979+1099 | 0 | 5229 | 10.0% | ✓ |

Images: `discovery/qa/services-390-sbs.png` (live left), `services-390-diff.png`

## singles @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1440

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.0% | ✓ |
| 07d1cc1 | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 0.1% | ✓ |
| a1a2f0b | 487+3207 | #1 section.service-list 487+3207 | 0 | 0 | 0.3% | ✓ |
| footer | 3694+486 | footer 3694+486 | 0 | 0 | 1.1% | ✓ |

Images: `discovery/qa/singles-1440-sbs.png` (live left), `singles-1440-diff.png`

## singles @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1024

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 07d1cc1 | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 0.1% | ✓ |
| a1a2f0b | 487+3135 | #1 section.service-list 487+3135 | 0 | 0 | 0.9% | ✓ |
| footer | 3621+503 | footer 3622+503 | 0 | 1 | 4.0% | ✓ |

Images: `discovery/qa/singles-1024-sbs.png` (live left), `singles-1024-diff.png`

## singles @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 390

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+130 | header 0+128 | -2 | 0 | 3.3% | ✓ |
| 07d1cc1 | 130+350 | #0 div.page-hero 128+350 | 0 | -2 | 0.1% | ✓ |
| a1a2f0b | 480+5616 | #1 section.service-list 478+5616 | 0 | -2 | 1.0% | ✓ |
| footer | 6096+1099 | footer 6094+1099 | 0 | -2 | 2.3% | ✓ |

Images: `discovery/qa/singles-390-sbs.png` (live left), `singles-390-diff.png`

## married @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1440

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.7% | ✓ |
| bf1631c | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 22.8% | ✓ |
| 3f84244 | 487+3605 | #1 section.service-list 487+3605 | 0 | 0 | 0.8% | ✓ |
| footer | 4092+486 | footer 4092+486 | 0 | 0 | 1.2% | ✓ |

Images: `discovery/qa/married-1440-sbs.png` (live left), `married-1440-diff.png`

## married @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1024

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| bf1631c | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 0.1% | ✓ |
| 3f84244 | 487+3490 | #1 section.service-list 487+3490 | 0 | 0 | 0.7% | ✓ |
| footer | 3977+503 | footer 3977+503 | 0 | 0 | 3.8% | ✓ |

Images: `discovery/qa/married-1024-sbs.png` (live left), `married-1024-diff.png`

## married @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 390

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+130 | header 0+128 | -2 | 0 | 3.3% | ✓ |
| bf1631c | 130+350 | #0 div.page-hero 128+350 | 0 | -2 | 0.1% | ✓ |
| 3f84244 | 480+5976 | #1 section.service-list 478+5976 | 0 | -2 | 1.5% | ✓ |
| footer | 6456+1099 | footer 6454+1099 | 0 | -2 | 2.2% | ✓ |

Images: `discovery/qa/married-390-sbs.png` (live left), `married-390-diff.png`

## resources @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1440

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.0% | ✓ |
| 0253779 | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 0.2% | ✓ |
| e95bd23 | 487+5611 | #1 section.resource-list 487+5611 | 0 | 0 | 1.0% | ✓ |
| footer | 6098+486 | footer 6098+486 | 0 | 0 | 1.1% | ✓ |

Images: `discovery/qa/resources-1440-sbs.png` (live left), `resources-1440-diff.png`

## resources @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1024

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 0253779 | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 0.2% | ✓ |
| e95bd23 | 487+4847 | #1 section.resource-list 487+4847 | 0 | 0 | 1.2% | ✓ |
| footer | 5334+503 | footer 5334+503 | 0 | 0 | 3.6% | ✓ |

Images: `discovery/qa/resources-1024-sbs.png` (live left), `resources-1024-diff.png`

## resources @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 390

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+130 | header 0+128 | -2 | 0 | 3.3% | ✓ |
| 0253779 | 130+350 | #0 div.page-hero 128+350 | 0 | -2 | 8.8% | ✓ |
| e95bd23 | 480+6665 | #1 section.resource-list 478+6665 | 0 | -2 | 1.9% | ✓ |
| footer | 7145+1099 | footer 7143+1099 | 0 | -2 | 2.2% | ✓ |

Images: `discovery/qa/resources-390-sbs.png` (live left), `resources-390-diff.png`

## books @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 6a91582 | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 0.9% | ✓ |
| 82738a8 | 487+2062 | #1 section.resource-list 487+2062 | 0 | 0 | 7.8% | ✓ |
| footer | 2549+486 | footer 2549+486 | 0 | 0 | 3.5% | ✓ |

Images: `discovery/qa/books-1440-sbs.png` (live left), `books-1440-diff.png`

## books @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.4% | ✓ |
| 6a91582 | 137+300 | #0 div.page-hero 137+300 | 0 | 0 | 0.9% | ✓ |
| 82738a8 | 437+1963 | #1 section.resource-list 437+1963 | 0 | 0 | 10.2% | ✓ |
| footer | 2400+503 | footer 2400+503 | 0 | 0 | 7.1% | ✓ |

Images: `discovery/qa/books-1024-sbs.png` (live left), `books-1024-diff.png`

## books @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 5.2% | ✓ |
| 6a91582 | 128+250 | #0 div.page-hero 128+250 | 0 | 0 | 2.6% | ✓ |
| 82738a8 | 378+3018 | #1 section.resource-list 378+3018 | 0 | 0 | 26.3% | ✓ |
| footer | 3395+1099 | footer 3396+1099 | 0 | 1 | 9.5% | ✓ |

Images: `discovery/qa/books-390-sbs.png` (live left), `books-390-diff.png`

## home @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.8% | ✓ |
| 5972661 | 137+920 | #0 div.heroslider 137+920 | 0 | 0 | 0.0% | ✓ |
| 1316243 | 1057+217 | #1 section.home-intro 1057+217 | 0 | 0 | 2.4% | ✓ |
| 04f860d | 1274+740 | #2 section.wave-section 1274+740 | 0 | 0 | 0.9% | ✓ |
| 1f26c99 | 2014+773 | #3 section.home-testimonials 2014+773 | 0 | 0 | 0.8% | ✓ |
| a5f2b88 | 2787+648 | #4 section.wave-section 2787+648 | 0 | 0 | 0.4% | ✓ |
| ab03957 | 3435+598 | #5 section.home-posts 3435+598 | 0 | 0 | 0.2% | ✓ |
| footer | 4034+486 | footer 4033+486 | 0 | -1 | 3.6% | ✓ |

Images: `discovery/qa/home-1440-sbs.png` (live left), `home-1440-diff.png`

## home @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.4% | ✓ |
| 5972661 | 137+788 | #0 div.heroslider 137+788 | 0 | 0 | 0.0% | ✓ |
| 1316243 | 925+217 | #1 section.home-intro 925+217 | 0 | 0 | 3.4% | ✓ |
| 04f860d | 1142+740 | #2 section.wave-section 1142+740 | 0 | 0 | 1.3% | ✓ |
| 1f26c99 | 1882+663 | #3 section.home-testimonials 1882+663 | 0 | 0 | 0.9% | ✓ |
| a5f2b88 | 2545+648 | #4 section.wave-section 2545+648 | 0 | 0 | 0.8% | ✓ |
| ab03957 | 3193+593 | #5 section.home-posts 3193+598 | 5 | 0 | 0.3% | ✗ |
| footer | 3787+503 | footer 3791+503 | 0 | 4 | 4.1% | ✓ |

Images: `discovery/qa/home-1024-sbs.png` (live left), `home-1024-diff.png`

## home @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 5.2% | ✓ |
| 5972661 | 128+864 | #0 div.heroslider 128+864 | 0 | 0 | 0.0% | ✓ |
| 1316243 | 992+337 | #1 section.home-intro 992+337 | 0 | 0 | 6.8% | ✓ |
| 04f860d | 1329+856 | #2 section.wave-section 1329+856 | 0 | 0 | 3.5% | ✓ |
| 1f26c99 | 2185+948 | #3 section.home-testimonials 2185+948 | 0 | 0 | 2.5% | ✓ |
| a5f2b88 | 3133+648 | #4 section.wave-section 3133+648 | 0 | 0 | 1.7% | ✓ |
| ab03957 | 3781+630 | #5 section.home-posts 3781+630 | 0 | 0 | 1.0% | ✓ |
| footer | 4411+1099 | footer 4411+1099 | 0 | 0 | 5.3% | ✓ |

Images: `discovery/qa/home-390-sbs.png` (live left), `home-390-diff.png`

## about @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.8% | ✓ |
| dc5bbca | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 7.4% | ✓ |
| 08f0ebe | 487+646 | #1 section.story-section 487+646 | 0 | 0 | 10.5% | ✓ |
| f7553c8 | 1133+473 | #2 section.values-section 1133+509 | 36 | 0 | 4.3% | ✗ |
| footer | 1607+486 | footer 1643+486 | 0 | 36 | 3.5% | ✓ |

Images: `discovery/qa/about-1440-sbs.png` (live left), `about-1440-diff.png`

## about @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.4% | ✓ |
| dc5bbca | 137+309 | #0 div.page-hero 137+309 | 0 | 0 | 8.6% | ✓ |
| 08f0ebe | 446+896 | #1 section.story-section 446+924 | 28 | 0 | 13.4% | ✗ |
| f7553c8 | 1342+667 | #2 section.values-section 1370+655 | -12 | 28 | 9.9% | ✗ |
| footer | 2009+503 | footer 2025+503 | 0 | 16 | 14.5% | ✓ |

Images: `discovery/qa/about-1024-sbs.png` (live left), `about-1024-diff.png`

## about @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 5.2% | ✓ |
| dc5bbca | 128+259 | #0 div.page-hero 128+259 | 0 | 0 | 15.6% | ✓ |
| 08f0ebe | 387+1380 | #1 section.story-section 387+1452 | 72 | 0 | 19.9% | ✗ |
| f7553c8 | 1767+1270 | #2 section.values-section 1839+1282 | 12 | 72 | 9.7% | ✗ |
| footer | 3036+1099 | footer 3121+1099 | 0 | 85 | 10.7% | ✓ |

Images: `discovery/qa/about-390-sbs.png` (live left), `about-390-diff.png`

## our-story @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.8% | ✓ |
| 53c9c08 | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 4.7% | ✓ |
| b112c71 | 487+632 | #1 section.story-section 487+632 | 0 | 0 | 8.9% | ✓ |
| footer | 1119+486 | footer 1119+486 | 0 | 0 | 3.5% | ✓ |

Images: `discovery/qa/our-story-1440-sbs.png` (live left), `our-story-1440-diff.png`

## our-story @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.4% | ✓ |
| 53c9c08 | 137+309 | #0 div.page-hero 137+309 | 0 | 0 | 5.4% | ✓ |
| b112c71 | 446+910 | #1 section.story-section 446+910 | 0 | 0 | 9.2% | ✓ |
| footer | 1356+503 | footer 1356+503 | 0 | 0 | 4.0% | ✓ |

Images: `discovery/qa/our-story-1024-sbs.png` (live left), `our-story-1024-diff.png`

## our-story @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 5.2% | ✓ |
| 53c9c08 | 128+259 | #0 div.page-hero 128+259 | 0 | 0 | 9.9% | ✓ |
| b112c71 | 387+1370 | #1 section.story-section 387+1390 | 20 | 0 | 14.2% | ✗ |
| footer | 1756+1099 | footer 1777+1099 | 0 | 21 | 5.3% | ✓ |

Images: `discovery/qa/our-story-390-sbs.png` (live left), `our-story-390-diff.png`

## founder @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.8% | ✓ |
| 3c82faa | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 3.5% | ✓ |
| 44900cd | 487+790 | #1 section.story-section 487+790 | 0 | 0 | 9.0% | ✓ |
| footer | 1277+486 | footer 1277+486 | 0 | 0 | 3.5% | ✓ |

Images: `discovery/qa/founder-1440-sbs.png` (live left), `founder-1440-diff.png`

## founder @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.4% | ✓ |
| 3c82faa | 137+309 | #0 div.page-hero 137+309 | 0 | 0 | 3.6% | ✓ |
| 44900cd | 446+1020 | #1 section.story-section 446+1020 | 0 | 0 | 9.6% | ✓ |
| footer | 1466+503 | footer 1466+503 | 0 | 0 | 3.9% | ✓ |

Images: `discovery/qa/founder-1024-sbs.png` (live left), `founder-1024-diff.png`

## founder @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 5.2% | ✓ |
| 3c82faa | 128+259 | #0 div.page-hero 128+259 | 0 | 0 | 7.1% | ✓ |
| 44900cd | 387+1744 | #1 section.story-section 387+1764 | 20 | 0 | 31.0% | ✗ |
| footer | 2131+1099 | footer 2151+1099 | 0 | 20 | 16.3% | ✓ |

Images: `discovery/qa/founder-390-sbs.png` (live left), `founder-390-diff.png`

## contact @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.8% | ✓ |
| 8d07512 | 137+350 | #0 div.page-hero 137+350 | 0 | 0 | 2.4% | ✓ |
| 171f4a3 | 487+352 | #1 section.contact-cards 557+212 | -140 | 70 | 20.7% | ✗ |
| footer | 839+486 | footer 839+486 | 0 | 0 | 3.5% | ✓ |

Images: `discovery/qa/contact-1440-sbs.png` (live left), `contact-1440-diff.png`

## contact @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 2.4% | ✓ |
| 8d07512 | 137+309 | #0 div.page-hero 137+309 | 0 | 0 | 3.1% | ✓ |
| 171f4a3 | 446+376 | #1 section.contact-cards 516+492 | 116 | 70 | 37.2% | ✗ |
| footer | 822+503 | footer 1078+503 | 0 | 256 | 4.0% | ✓ |

Images: `discovery/qa/contact-1024-sbs.png` (live left), `contact-1024-diff.png`

## contact @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 5.2% | ✓ |
| 8d07512 | 128+259 | #0 div.page-hero 128+259 | 0 | 0 | 12.0% | ✓ |
| 171f4a3 | 387+495 | #1 section.contact-cards 437+1140 | 645 | 50 | 47.8% | ✗ |
| footer | 882+1099 | footer 1627+1099 | 0 | 745 | 5.3% | ✓ |

Images: `discovery/qa/contact-390-sbs.png` (live left), `contact-390-diff.png`

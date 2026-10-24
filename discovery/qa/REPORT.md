# Visual parity report

Base: http://localhost:4321 · tolerance ±4px · 2026-10-24T12:11

| Page | Width | Page height live → new | Pixel diff | Sections off |
|---|---|---|---|---|
| category | 1440 | 6876 → 6882 (+6) | 5.6% (full 5.8%) | 1/3 |
| category | 1024 | 7208 → 7110 (-98) | 60.4% (full 61.6%) | 1/3 |
| category | 390 | 6257 → 6215 (-42) | 7.9% (full 7.0%) | 1/3 |
| tag | 1440 | 6852 → 6882 (+30) | 9.8% (full 10.4%) | 1/3 |
| tag | 1024 | 7208 → 7110 (-98) | 60.7% (full 62.0%) | 1/3 |
| tag | 390 | 6256 → 6215 (-41) | 10.5% (full 11.4%) | 1/3 |
| service-type | 1440 | 4455 → 4459 (+4) | 2.4% (full 2.7%) | 0/3 |
| service-type | 1024 | 4568 → 4500 (-68) | 27.1% (full 28.7%) | 1/3 |
| service-type | 390 | 4547 → 4661 (+114) | 24.3% (full 26.4%) | 1/3 |
| resource-type | 1440 | 2563 → 2565 (+2) | 1.4% (full 1.8%) | 0/3 |
| resource-type | 1024 | 2652 → 2654 (+2) | 31.0% (full 30.9%) | 0/3 |
| resource-type | 390 | 3090 → 3346 (+256) | 29.5% (full 36.4%) | 1/3 |
| search | 1440 | 6380 → 6424 (+44) | 44.5% (full 45.2%) | 1/3 |
| search | 1024 | 6558 → 6589 (+31) | 54.2% (full 54.5%) | 1/3 |
| search | 390 | 5919 → 6435 (+516) | 38.0% (full 46.0%) | 1/3 |

## category @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| hello-main | 145+6225 | #0 div.site-main 145+6231 | 6 | 0 | 6.1% | ✗ |
| footer | 6390+486 | footer 6396+486 | 0 | 6 | 1.2% | ✓ |

Images: `discovery/qa/category-1440-sbs.png` (live left), `category-1440-diff.png`

## category @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| hello-main | 145+6541 | #0 div.site-main 145+6442 | -99 | 0 | 65.3% | ✗ |
| footer | 6706+503 | footer 6607+503 | 0 | -99 | 13.4% | ✓ |

Images: `discovery/qa/category-1024-sbs.png` (live left), `category-1024-diff.png`

## category @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| hello-main | 136+5003 | #0 div.site-main 136+4960 | -43 | 0 | 7.4% | ✗ |
| footer | 5158+1099 | footer 5116+1099 | 0 | -42 | 10.7% | ✓ |

Images: `discovery/qa/category-390-sbs.png` (live left), `category-390-diff.png`

## tag @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| hello-main | 145+6201 | #0 div.site-main 145+6231 | 30 | 0 | 10.7% | ✗ |
| footer | 6366+486 | footer 6396+486 | 0 | 30 | 1.2% | ✓ |

Images: `discovery/qa/tag-1440-sbs.png` (live left), `tag-1440-diff.png`

## tag @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| hello-main | 145+6541 | #0 div.site-main 145+6442 | -99 | 0 | 65.7% | ✗ |
| footer | 6706+503 | footer 6607+503 | 0 | -99 | 13.4% | ✓ |

Images: `discovery/qa/tag-1024-sbs.png` (live left), `tag-1024-diff.png`

## tag @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| hello-main | 136+5002 | #0 div.site-main 136+4960 | -42 | 0 | 11.7% | ✗ |
| footer | 5158+1099 | footer 5116+1099 | 0 | -42 | 5.6% | ✓ |

Images: `discovery/qa/tag-390-sbs.png` (live left), `tag-390-diff.png`

## service-type @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| hello-main | 145+3810 | #0 div.site-main 145+3813 | 3 | 0 | 2.6% | ✓ |
| footer | 3969+486 | footer 3973+486 | 0 | 4 | 1.0% | ✓ |

Images: `discovery/qa/service-type-1440-sbs.png` (live left), `service-type-1440-diff.png`

## service-type @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| hello-main | 145+3906 | #0 div.site-main 145+3837 | -69 | 0 | 31.1% | ✗ |
| footer | 4065+503 | footer 3997+503 | 0 | -68 | 3.7% | ✓ |

Images: `discovery/qa/service-type-1024-sbs.png` (live left), `service-type-1024-diff.png`

## service-type @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| hello-main | 136+3299 | #0 div.site-main 136+3412 | 113 | 0 | 30.1% | ✗ |
| footer | 3449+1099 | footer 3563+1099 | 0 | 114 | 9.3% | ✓ |

Images: `discovery/qa/service-type-390-sbs.png` (live left), `service-type-390-diff.png`

## resource-type @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| hello-main | 145+1918 | #0 div.site-main 145+1919 | 1 | 0 | 1.5% | ✓ |
| footer | 2077+486 | footer 2079+486 | 0 | 2 | 1.0% | ✓ |

Images: `discovery/qa/resource-type-1440-sbs.png` (live left), `resource-type-1440-diff.png`

## resource-type @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| hello-main | 145+1990 | #0 div.site-main 145+1991 | 1 | 0 | 39.9% | ✓ |
| footer | 2149+503 | footer 2151+503 | 0 | 2 | 3.7% | ✓ |

Images: `discovery/qa/resource-type-1024-sbs.png` (live left), `resource-type-1024-diff.png`

## resource-type @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| hello-main | 136+1841 | #0 div.site-main 136+2096 | 255 | 0 | 42.6% | ✗ |
| footer | 1991+1099 | footer 2247+1099 | 0 | 256 | 10.8% | ✓ |

Images: `discovery/qa/resource-type-390-sbs.png` (live left), `resource-type-390-diff.png`

## search @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| hello-main | 145+5729 | #0 div.site-main 145+5773 | 44 | 0 | 49.2% | ✗ |
| footer | 5894+486 | footer 5938+486 | 0 | 44 | 1.0% | ✓ |

Images: `discovery/qa/search-1440-sbs.png` (live left), `search-1440-diff.png`

## search @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| hello-main | 145+5890 | #0 div.site-main 145+5922 | 32 | 0 | 59.6% | ✗ |
| footer | 6055+503 | footer 6087+503 | 0 | 32 | 3.9% | ✓ |

Images: `discovery/qa/search-1024-sbs.png` (live left), `search-1024-diff.png`

## search @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| hello-main | 136+4665 | #0 div.site-main 136+5180 | 515 | 0 | 47.2% | ✗ |
| footer | 4820+1099 | footer 5336+1099 | 0 | 516 | 3.0% | ✓ |

Images: `discovery/qa/search-390-sbs.png` (live left), `search-390-diff.png`

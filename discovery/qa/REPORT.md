# Visual parity report

Base: http://localhost:4321 · tolerance ±4px · 2026-10-24T11:15

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

## single-service @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| d355bcc | 137+900 | d355bcc 137+900 | 0 | 0 | 0.5% | ✓ |
| footer | 1037+486 | footer 1037+486 | 0 | 0 | 1.1% | ✓ |

Images: `discovery/qa/single-service-1440-sbs.png` (live left), `single-service-1440-diff.png`

## single-service @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| d355bcc | 137+1000 | d355bcc 137+1001 | 1 | 0 | 1.0% | ✓ |
| footer | 1137+503 | footer 1138+503 | 0 | 1 | 3.9% | ✓ |

Images: `discovery/qa/single-service-1024-sbs.png` (live left), `single-service-1024-diff.png`

## single-service @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| d355bcc | 128+973 | d355bcc 128+973 | 0 | 0 | 7.9% | ✓ |
| footer | 1100+1099 | footer 1101+1099 | 0 | 1 | 5.3% | ✓ |

Images: `discovery/qa/single-service-390-sbs.png` (live left), `single-service-390-diff.png`

## single-resource @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| 179cb8b6 | 137+956 | 179cb8b6 137+956 | 0 | 0 | 1.1% | ✓ |
| footer | 1092+486 | footer 1093+486 | 0 | 1 | 1.1% | ✓ |

Images: `discovery/qa/single-resource-1440-sbs.png` (live left), `single-resource-1440-diff.png`

## single-resource @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 179cb8b6 | 137+821 | 179cb8b6 137+818 | -3 | 0 | 4.5% | ✓ |
| footer | 958+503 | footer 955+503 | 0 | -3 | 4.1% | ✓ |

Images: `discovery/qa/single-resource-1024-sbs.png` (live left), `single-resource-1024-diff.png`

## single-resource @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| 179cb8b6 | 128+1105 | 179cb8b6 128+1105 | 0 | 0 | 7.7% | ✓ |
| footer | 1232+1099 | footer 1233+1099 | 0 | 1 | 5.5% | ✓ |

Images: `discovery/qa/single-resource-390-sbs.png` (live left), `single-resource-390-diff.png`

## single-resource-book @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| 79ce132 | 137+900 | 179cb8b6 137+900 | 0 | 0 | 0.1% | ✓ |
| footer | 1037+486 | footer 1037+486 | 0 | 0 | 1.1% | ✓ |

Images: `discovery/qa/single-resource-book-1440-sbs.png` (live left), `single-resource-book-1440-diff.png`

## single-resource-book @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 79ce132 | 137+768 | 179cb8b6 137+768 | 0 | 0 | 3.0% | ✓ |
| footer | 905+503 | footer 905+503 | 0 | 0 | 3.9% | ✓ |

Images: `discovery/qa/single-resource-book-1024-sbs.png` (live left), `single-resource-book-1024-diff.png`

## single-resource-book @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+127 | header 0+128 | 1 | 0 | 3.6% | ✓ |
| 79ce132 | 127+1103 | 179cb8b6 128+1103 | 0 | 1 | 8.0% | ✓ |
| footer | 1231+1099 | footer 1231+1099 | 0 | 0 | 5.4% | ✓ |

Images: `discovery/qa/single-resource-book-390-sbs.png` (live left), `single-resource-book-390-diff.png`

## single-resource-video @1440

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1425 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.4% | ✓ |
| 179cb8b6 | 137+900 | 179cb8b6 137+900 | 0 | 0 | 10.5% | ✓ |
| footer | 1037+486 | footer 1037+486 | 0 | 0 | 1.1% | ✓ |

Images: `discovery/qa/single-resource-video-1440-sbs.png` (live left), `single-resource-video-1440-diff.png`

## single-resource-video @1024

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 1009 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+137 | header 0+137 | 0 | 0 | 1.9% | ✓ |
| 179cb8b6 | 137+768 | 179cb8b6 137+768 | 0 | 0 | 12.9% | ✓ |
| footer | 905+503 | footer 905+503 | 0 | 0 | 3.9% | ✓ |

Images: `discovery/qa/single-resource-video-1024-sbs.png` (live left), `single-resource-video-1024-diff.png`

## single-resource-video @390

Fonts loaded on new site: Nunito, Poppins, Roboto · layout width 375 (reference had a scrollbar)

| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |
|---|---|---|---|---|---|---|
| header | 0+128 | header 0+128 | 0 | 0 | 3.3% | ✓ |
| 179cb8b6 | 128+844 | 179cb8b6 128+844 | 0 | 0 | 18.8% | ✓ |
| footer | 972+1099 | footer 972+1099 | 0 | 0 | 5.4% | ✓ |

Images: `discovery/qa/single-resource-video-390-sbs.png` (live left), `single-resource-video-390-diff.png`

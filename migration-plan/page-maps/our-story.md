# Our Story `/our-story/` (Elementor page 28) and Our Founder `/founder/` (page 30)

Both pages use the **same layout** as About sections 1–2 (`about.md`): `PageHero` (photo) + a two-column "story + photo" section. There's no Values section. Build them from one `StoryPage` layout.

## Our Story
| Section | 1440 | 1024 | 390 |
|---|---|---|---|
| PageHero `53c9c08` | 137+350 | 137+309 | 128+259 |
| Story + photo `b112c71` | 487+632 | 446+910 | 387+1370 |
| Footer | 1119+486 | 1356+503 | 1756+1099 |
| **Page** | 1605 | 1858 | 2855 |

- PageHero title "Our Story", image `2025/06/GetPaidStock.com-6567a16e8212f.jpg`.
- Text column: 5 paragraphs, Poppins 16px/24px `#2E2E2E`, **drop cap** on "A" (same spec as About). No entrance animation on this page.
- Photo column: `uploads/2025/06/DSC08323-scaled-1.jpg`, cover, centre; height matches the text (572 @1440). @1024: stacked, `min-height: 450px`, `background-position: 0 -110px`. @390: `min-height: 450px`, centre.

## Our Founder
| Section | 1440 | 1024 | 390 |
|---|---|---|---|
| PageHero `3c82faa` | 137+350 | 137+309 | 128+259 |
| Story + photo `44900cd` | 487+790 | 446+1020 | 387+1744 |
| Footer | 1277+486 | 1466+503 | 2131+1099 |
| **Page** | 1763 | 1969 | 3229 |

- PageHero title "Our Founder", image `2025/06/Runway-2023-10-23T08_30_02.310Z-Expand-Image-scaled-1.jpg`.
- Text: 6 paragraphs with a drop cap on "R". The last paragraph is **bold** (`<strong>`, Poppins 700): "To book Ruth Esumeh to speak at your next event, fill the booking form here." "here" links to `https://form.typeform.com/to/T6W82ycq` (new tab), link colour **`#CC3366`** (Hello theme default link colour, `a { color: #c36 }`).
- Photo: the same `DSC08323-scaled-1.jpg`, height = text column (730 @1440); same responsive rules as Our Story.

## Data
`pages/our-story`, `pages/founder`: `hero_image`, `content` (Portable Text), `side_image`.

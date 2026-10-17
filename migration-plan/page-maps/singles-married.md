# Singles `/singles/` (page 33) and Married `/married/` (page 35)

Identical layout; only the title and the service filter differ (`service_type` = `singles` / `married`). The same section also builds `/service-type/{slug}/` (see `archives.md`).

| Section | Singles 1440 | 1024 | 390 | Married 1440 | 1024 | 390 |
|---|---|---|---|---|---|---|
| Hero | 137+350 | 137+350 | 128+350 | 137+350 | 137+350 | 128+350 |
| Service list | 487+3207 | 487+3157 | 478+5617 | 487+3605 | 487+3484 | 478+5979 |
| Footer | 3694+486 | 3644+503 | 6095+1099 | 4092+486 | 3971+503 | 6457+1099 |
| **Page** | 4180 | 4146 | 7193 | 4577 | 4473 | 7555 |

## 1. Hero → `PageHero` variant `pattern-flat` (close to component 394, but measured differently)
- Full width, **min-height 350px at every width**, padding `0 10px`. Title centred horizontally **and** vertically.
- Background: `uploads/2025/06/pink-overlapping-circles-pattern-beautiful-elegant-illustration-graphic-art-design-pink-overlapping-circles-pattern-204064734.webp` (Married uses the `…-1.webp` copy of the same image), `background-size: auto; background-repeat: repeat; background-position: center`. Overlay `::before`: **`#5A0F36` at 0.89**.
- Title (h1): Nunito **600 55px/55px** white, at every width.
- **Bottom shape divider "waves"**: `assets/waves.svg` (viewBox `0 0 1000 100`, `preserveAspectRatio="none"`), fill **white**, **height 37px**, width `calc(100% + 1.3px)`, flipped (`rotate(180deg)`) and pinned to the bottom edge.

## 2. Service list (alternating rows)
Source: `services` filtered by `service_type`, ordered by `order` (live order: Singles = Relationship Clarity, Dating Couples, Six Weeks Individual, Private Premarital, Dating Couple Coaching; Married: check `discovery/content/services.json`). Rows **alternate** between two layouts: index 0, 2, 4 = **A**; 1, 3, 5 = **B**. No gap between rows; each row has a 10px outer padding (live listing gap).

### Row layout A (template 153): white, image left
- Row: flex **row**, padding `0 10px`, boxed 1140 (`flex-wrap: wrap` on mobile).
- **Image column** 40% (448px @1440, 388 @1024, full width @390), padding `20px 20px 50px` (`20px` @390), content centred vertically. **Sticky** (`position: sticky; top: 0`) within the row on desktop and tablet only.
  - Image: service `featured_image`, natural aspect (408×292 @1440), **border 2px solid `#BF1E7224`, radius 5px**.
- **Text column** 60% (672 @1440, 581 @1024), padding `50px 30px` (`30px` @390), gap 20px, content centred vertically, **all text centred**:
  - Title h2: Nunito **700 32px/32px `#000000`**.
  - Audience label (`audience_label`), shown only when present: Poppins **400 italic 17px/17px** `#000`, `margin-top: -10px`.
  - Format (`format`, e.g. "WhatsApp Phone Call Session"): Poppins **600 16px/16px** `#000`.
  - Description (`content`): Poppins 400 **15px/22.5px** `#2E2E2E`, paragraph gap 14.4px.
  - Button "Details & Pricing" → `/service/{slug}/`: Nunito **600** 15px, white on **`#BF1E72`**, padding 12px 24px, radius 20px, centred.
- @390: the image column stacks **above** the text.

### Row layout B (template 149): pink wave band, image right
- Row: full width, bg **`#BF1E7224`** (`--color-primary-14`), flex row, padding `70px 50px` (`80px 20px` @390). On mobile `flex-direction: column-reverse` (**image first**).
- **Wave-brush shape dividers** top and bottom (`assets/wave-brush.svg`, white fill): **height 60px, width `calc(100% + 1.3px)`** (@390: 40px, width `calc(150% + 1.3px)`). Bottom one flipped.
- **Text column** 60%, padding `70px 30px`, gap 20px, centred text:
  - Title h2: Nunito 700 32px/32px **`#444547`**.
  - Audience label: same as A (when present).
  - Format: Poppins 600 16px `#000`.
  - Description: Poppins 400 **16px/24px** `#2E2E2E` (note: 16 here, 15 in A).
  - Button "Details & Pricing": Nunito 600 15px, white on **`#ED0D82`**, padding 12px 24px, radius 20px.
- **Image column** 40%, padding `20px 20px 50px`, `justify-content: flex-start`, **sticky** on desktop/tablet. Image: square (408×408 @1440), **no border, no radius**.

The A/B differences (title colour, text size, button colour, image border) are deliberate on live. Keep them.

## Data
- `pages/singles`, `pages/married`: `hero_title`; the list is query-driven.
- `services`: `audience_label`, `format`, `content`, `featured_image`, `order`.

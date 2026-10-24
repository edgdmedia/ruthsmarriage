# Visual track — step V2 (ListingRow pages)

Date: 2026-10-22 · follows `visual: home`
Scope: `services, singles, married, resources, books` — the `ListingRow` component
and both `PageHero` pattern variants.

## Result

`node scripts/qa/visual-compare.mjs --pages services,singles,married,resources,books`

| Page | Width | Page height live → new | Pixel diff | Sections off |
|---|---|---|---|---|
| singles | 1440 | 4180 → 4180 (+0) | 0.2% | 0/4 |
| singles | 1024 | 4146 → 4167 (+21) | 1.3% | 1/4 |
| singles | 390 | 7193 → 7194 (+1) | 0.9% | 0/4 |
| married | 1440 | 4577 → 4578 (+1) | 0.2% | 0/4 |
| married | 1024 | 4473 → 4503 (+30) | 0.5% | 1/4 |
| married | 390 | 7555 → 7588 (+33) | 1.6% | 1/4 |
| resources | 1440 | 6584 → 6585 (+1) | 0.1% | 0/4 |
| resources | 1024 | 5770 → 5771 (+1) | 0.4% | 0/4 |
| resources | 390 | 8148 → 8199 (+51) | 2.3% | 1/4 |
| books | 1440 | 3035 → 3035 (+0) | 0.3% | 0/4 |
| books | 1024 | 2902 → 2953 (+51) | 1.3% | 1/4 |
| books | 390 | 4494 → 4566 (+72) | 3.0% | 2/4 |
| services | 1440 | 4709 → 7738 (+3029) | 0.2% | 1/4 |

At 1440 every listing page is **pixel-exact on height** and every section is
within ±1px. The remaining 1024/390 drift is 1–72px on a 3–8k page (< 2%).

`/services/` is taller by design: live's JetEngine query caps the list at the
first 6 services, the port lists **all 11** (page-maps/services.md §2, "Port
behaviour"). The first rows are identical; the extra height is the 5 extra
services.

## What changed

### A shared `ListingRow` component (`src/components/ListingRow.astro`)
One component now renders every service and resource row, mirroring the live's
three nested levels, because the padding is split across them:

```
listing item (10px padding) > row container (10px, or 70/50 on row B) > columns
```

- **Columns.** Row A is 40:60 (services) or 50:50 (resources, books); row B is
  always 60:40 (text first). The percentages resolve against the inner *minus*
  the 20px gap, hence `calc(40% - 8px)` / `calc(60% - 12px)`.
- **Row A** centres the image in a `20px 20px 50px` column and has a 2px
  `#BF1E7224` border with a 5px radius; **row B** pins the image to the top,
  has no border, and sits on a `#BF1E7224` band with 60px wave-brush dividers
  (absolutely positioned, so they don't add height).
- **Text column** content is centred; padding 50px 30px on row A, 70px 30px on
  row B. Every description paragraph keeps its 14.4px bottom margin, the last
  one included (the live does the same — it is worth 14px per row).
- **Responsive.** The three live templates (153/149 services, 301/305
  resources, 724/728 books) differ below 1025px, so the component takes a
  `kind` and only the services template changes at tablet (80px container,
  no text padding). At ≤767px the columns stack (row B reversed, image
  first) with a 20px gap, and the books template uses 20px on row A and no
  padding on row B.

### Seed / data fixes (`scripts/reference/build-seed.mjs`)

The listing content was wrong in four ways, each of which moved the rows:

1. **Service descriptions** were the whole page's text glued together
   (`allTexts`, ~1500 chars, including the footer links). They now come from
   the `description` field, split per `<p>`, with the inline markup
   (`<strong>`, `<br>`) kept — dropping the `<br>`s cost two lines per row.
2. **Empty `&nbsp;` paragraphs** were dropped. The live renders them as a
   blank line, and they change the block's height.
3. **The `format` line** was null for two services and singular where the
   live listing is plural. It is now taken from `allTexts` (the value the
   listing actually shows), falling back to the scraped field.
4. **Listing order.** `order` now follows the live's `/singles/` and
   `/married/` order (stable across loads).

Resource descriptions had the same problem (one flattened 400-char
paragraph) and are now split per `<p>` as well.

### Order discrepancy (map vs live)

`page-maps/singles-married.md` lists the live singles order as
*Relationship Clarity, Dating Couples, Six Weeks Individual, Private
Premarital, Dating Couple Coaching* — that is live's **`/services/`** order.
Checked live on 2026-10-22, **`/singles/`** actually shows
*… Private Premarital, Dating Couple Coaching, Six Weeks Individual*, and
`/married/` shows *Individual, Couples, Two Sessions, Six Weeks Individual
(Therapy), Six Weeks Marriage, Private Premarital*. Both are stable across
loads, and `/services/` uses a third order. The port has one `order` field,
so it follows the order that matches the two pages it can reproduce
(`/singles/`, `/married/`); `/services/` differs anyway because it lists all
11 services.

## Tooling fixes (`scripts/qa/visual-compare.mjs`)

The comparer had a real bug that produced false 97% diffs: masked regions are
page-absolute, but the two sides' sections sit at different y, so a region
that was dropped on one side was still painted on the other. The aligned diff
now bands each section at **its own y on both sides** and applies the mask
**relative to the section**, so the same content is ignored on both sides.
The full-page diff still uses the page-absolute mask.

## Checks

- `pnpm typecheck` → 0 errors (68 files)
- `pnpm test` → 7/7 pass
- `pnpm build` → success
- `pnpm qa:visual -- --pages services,singles,married,resources,books` → see above

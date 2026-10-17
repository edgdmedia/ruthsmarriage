# Blog Articles `/inspired-features/` (Elementor page 43)

| Section | 1440 | 1024 | 390 |
|---|---|---|---|
| PageHero `photo` `0ec2c40` | 137+350 | 137+309 | 128+259 |
| Posts + sidebar `ccc1aa1` | 487+2899 | 446+2931 | 387+6541 |
| Footer | 3386+486 | 3377+503 | 6927+1099 |
| **Page** | 3872 | 3879 | 8026 |

## 1. PageHero (`photo`)
Title **"Blog Articles"** (the page slug stays `inspired-features`), image `2025/06/GetPaidStock.com-64e4f5133c96c.jpg`.

## 2. Posts + sidebar (`ccc1aa1`)
- Full width, padding `0 10px`, 10px top/bottom. Boxed 1140, flex row, gap 20: **main 840px** (727 @1024) + **sidebar 280px** (242 @1024). @390 they stack, with the sidebar **below** all posts.

### Main: post grid
- Padding 10px. A JetEngine grid of **all published posts** (16 on live, **no pagination**, newest first): **2 columns** (desktop and tablet), **1** @390.
- Each cell is 420 wide (363 @1024, 355 @390) with 10px padding. It holds the **same `PostCard`** as the homepage (`home.md` §6), only wider: card 400×339, image 370×164. Rows are 359 tall, with no extra gap.

### Sidebar (`b4ac538`)
- Padding 10px, gap 20px between widgets. **Sticky** (top 0) on desktop/tablet; not sticky @390.
- Two panels, each: bg **`rgba(141,141,141,.13)`** (`#8D8D8D21`), **radius 20px**, padding 20px, internal gap 5px.
  1. **Search**:
     - Heading h5 "Search": **Roboto 600 19px/19px `#000`**.
     - Divider: full-width 1px solid `#000` (widget 15px tall).
     - Search form: the input (182×35) and the button are joined. Input: bg `rgba(255,255,255,.35)`, radius `20px 0 0 20px`, padding `5px 22px 5px 10px`, system font 16px `#2E2E2E`, placeholder "Type to start searching...". Button 38×35: bg `#ED0D82`, radius `0 20px 20px 0`, white `fas-search` icon. Submits to `/search/?q=` (live is the Elementor search widget with live results off).
  2. **Popular Posts**:
     - Heading h5 "Popular Posts" + divider (same as above).
     - List of **6 posts**, 1 column, row gap 19px: each row (220×90) is a thumbnail link (77px wide, 20px right margin, image 77×72 cover, no radius) + title h6 **Nunito 600 13px/15.6px `#000`** linked to the post.
     - "Popular" on live is Elementor's default posts query (latest 6). Use the latest 6 posts.

## Data
Query-driven; `pages/inspired-features` holds `hero_title` + `hero_image`.

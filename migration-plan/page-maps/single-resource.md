# Single resource `/resource/{slug}/` (Elementor single template 590)

Samples: resource `/resource/the-love-playbook/`, book `/resource/52-rules-of-dating-and-relationships/`, video `/resource/how-do-we-discuss-our-sexual-fantasies-in-marriage/`. Screenshots: `single-resource*-{1440,1024,390}.png`.

| Page | 1440 | 1024 | 390 |
|---|---|---|---|
| Main (resource) | 137+956 | 137+821 | 128+1105 |
| Main (book) | 137+900 | 137+768 | 127+1103 |
| Main (video) | 137+900 | 137+768 | 128+844 |

## Main section
**Same shell as the single service page** (`single-service.md`): bg `#BF1E7224`, `min-height: 100vh`, flex row, padding `0 10px`, boxed 1140. The image column (544px, padding 20px, centred) is followed by the text column (576px, padding 50px, centred, text centred, gap 20px).
- Unlike services, template 590 has **no responsive overrides**: @1024 it **stays a row** (468 : 501). @≤767 it stacks (Elementor's default `flex-wrap` for mobile), image first, and the text column keeps **50px** padding.
- **Image**: `featured_image` at its natural aspect, full column width (504px wide @1440; e.g. the Love Playbook cover 1080×1920 shows at 504×896). No border or radius.

**Text column:**
1. **Term pill**: on live it renders **empty** (a 10×1px pink sliver), because the resource-type term isn't output. Don't render it.
2. **h1 title**: Nunito 700 24px/24px `#444547`.
3. Audience label / format: present in the template but empty for every resource. Omit them.
4. **Content**: Poppins 400 16px/24px `#2E2E2E`, centred.
5. **CTA buttons row**: flex, wrap, centred, gap 20px, padding 10px. One button per CTA: Nunito **600** 15px, white on **`#ED0D82`**, padding 12px 24px, radius 20px. Examples: Love Playbook → "Learn More" `https://links.ruthsmarriage.com/love-playbook`. "52 Rules" → **"Selar (ebook)"** `https://selar.co/4486h3` + **"Amazon"** `https://www.amazon.com/dp/B0F676DYM3`. External links open in the same tab on live; keep that.

## Video resources
Live shows **only the title**: no image, content or buttons (the template doesn't output the video). **Port behaviour:** render the `video_url` as the lite YouTube embed (`resources-books-videos.md`) in the **image column** (16:9, full column width). It's a deliberate improvement, listed in the audit's Known issues, so QA expects a difference here.

## Data model change (Phase 3)
`resources` needs a **repeatable CTA list** instead of one `cta_label`/`cta_url`: `ctas: [{ label, url }]` (EmDash repeater/array field, or a JSON field if the version has no repeater). Keep `badge_label` for the home carousel pill. Take each resource's buttons from its rendered single page in the Phase 1 dump.

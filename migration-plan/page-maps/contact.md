# Contact `/contact/` (Elementor page 52)

| Section | 1440 | 1024 | 390 |
|---|---|---|---|
| PageHero `8d07512` | 137+350 | 137+309 | 128+259 |
| Cards `171f4a3` | 487+352 | 446+376 | 387+495 |
| Footer | 839+486 | 822+503 | 882+1099 |
| **Page** | 1325 | 1324 | 1980 |

## 1. PageHero (`photo`)
Title "Contact", image `2025/06/GetPaidStock.com-64f716fb8016a.jpg`.

## 2. Two cards (`171f4a3`)
- Full width, padding `0 50px` (`0 30px` @390); the cards start 70px down (50 @390), with 70px below them. Boxed 1140 row: **two cards of 560px**, gap 20, each **212px tall** and vertically centred. Entrance `fadeInDown` on both.
- @1024: side by side at 445px each, 236 tall. @390: stacked at 315px wide; the Email card is 236 tall, Social 139.

**Email card** (`cfa9b4c`)
- bg image = the hero image again (`GetPaidStock.com-64f716fb8016a.jpg`), cover, centre, **radius 30px**, padding 40px, gap 10px. Overlay `::before`: **`#000` at opacity 0.78**, radius 30px.
- Icon `far-envelope` **50px** `#BF1E72`, centred.
- Heading "Email": Nunito 600 32px/32px **white**, centred.
- Text: the two addresses as `mailto:` links (fix live's web.archive.org hrefs), Poppins 16px/24px white, centred, comma-separated on one line: "admin@ruthsmarriage.com, ruthsmarriage@gmail.com". Source: site settings `contact_emails`.

**Social card** (`9896a48`)
- bg white, **radius 30px**, border `1px solid rgba(191,30,114,.05)`, `box-shadow: 0 0 31px -10px rgba(49,49,49,.5)`, padding 30px, gap 20px, content centred.
- Heading "Social Media": Nunito 600 32px/32px **`#222324`**, centred.
- Social icons: the same 5 circles as the footer (34px, 17px icons, brand colours), centred, from settings (README D14). On live the YouTube and Instagram anchors have no href; use the settings values, and **hide** an icon whose URL is empty (YouTube until G3).

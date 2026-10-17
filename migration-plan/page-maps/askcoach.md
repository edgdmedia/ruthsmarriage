# Ask Coach `/askcoach/` (Elementor page 54, template **`elementor_canvas`**)

**No header, no footer, no marquee**: render with `Canvas.astro`. The page is one full-viewport section. There's no scrollbar at desktop, so the layout width is the full **1440 / 1024 / 390**.

## Section (`f0a600b`)
- `min-height: 100vh`, flex column, **`justify-content: center`** (vertically centred), padding **50px**, white background.
- Content column: **627px** wide, centred (`--content-width: 627px`); @390 it's 290px (viewport minus 2×50).
- Stack (top → bottom), with 20px default widget spacing:
  1. **h1 "Need Advice?"**: Nunito **700 32px/32px** `#000`, centred (an h2 on live).
  2. **Divider**: **1px solid `#000`**, **86% wide** (539px of 627), centred. The widget is 31px tall (15px above and below the line).
  3. **Intro (h5 style)**: Nunito **500 20px/20px** `#000`, centred: "Send your questions below to get helpful answers from Coach Ruth in one of the YouTube episodes on Ask Coach Ruth! Your questions may also be shared with our Instagram channel community. Don't worry, it's strictly anonymous!" (4 lines @1440, 9 @390). Store it as editable page content.
  4. **Form** (Phase 6.4 handles behaviour):
     - Label "Category": Poppins 400 16px/16px `#2E2E2E`, padding-bottom 12px.
     - Select `name=category`, full width, **40px** tall: Poppins 16px `#0E0E0E`, bg white, **1px solid `#69727D`, radius 7px**, padding `5px 20px 5px 14px`, with the native arrow. Options: Love, Dating, Marriage, Sex, Faith, Life (first selected).
     - 31px gap, then label "Question" (same style).
     - Textarea `name=question`, rows 4 (96px tall), placeholder "Question": Poppins **15px/21px** `#0E0E0E`, same border/radius, padding `5px 14px`. Live doesn't mark it required; the port **requires** it (server-side validation, so empty questions never reach the inbox).
     - 31px gap, then button **"Send"**: Nunito 500 15px white on **`#252525`**, radius 20px, height 40, padding `0 24px`. Width **25% of the form** (149px) on desktop/tablet, **100%** @≤767. Hover keeps white text. Left-aligned.
     - Messages: on success replace the button row with Elementor-style text "Your submission was successful." (Poppins 16px, `#2E2E2E`, green-tinted as Elementor's `.elementor-message-success`). On error: "Your submission failed because of an error." The Turnstile widget sits between the textarea and the button (managed, normal size). This is the only visual addition to the page.
  5. **Social icons**: 2 rounded squares **50×50, radius 15px**, icon 25px white, gap 5px, centred: YouTube (bg `#CD201F`, URL from settings: hide it until the G3 URL exists) and Instagram (bg `#262626`, `https://instagram.com/askcoachruth`). New tab.

## Vertical positions (QA)
| Element | 1440 (y) | 1024 | 390 |
|---|---|---|---|
| Title | 167 | 101 | 89 |
| Select | 398 | 332 | 420 |
| Send button | 624 | 558 | 646 |
| Social icons | 684 | 618 | 706 |
Positions shift by the Turnstile widget height. Compare with the widget masked, or with Turnstile in invisible/compact mode if the human prefers (decide at G3).

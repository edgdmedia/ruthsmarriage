# Visual track — step V7 (interactions sweep)

Date: 2026-10-24.
Check: `node scripts/qa/interactions.mjs` → **37/37 PASS** (dropdowns, keyboard,
sticky header + sidebar, marquee, carousels, reduced motion, mobile menu at 1024
and 390). Visuals compared with `discovery/screenshots/live/states/*`.

## Bugs found and fixed
- **Carousel autoplay never ran.** `bc56788` dropped Swiper's Autoplay module
  believing `swiper/modules` didn't export it; Swiper 14.3 does
  (`modules/index.mjs` line 13). Restored: all 5 carousels autoplay (hero 9s,
  content 5s), pause on hover, stop under reduced motion.
- **Main bar wasn't sticky.** Its sticky box was the header wrapper, which scrolled
  away. The whole header is now `position: sticky; top: -52px`, so the marquee
  scrolls off and the main bar stays pinned.
- **Mobile menu didn't match live.** Ours had a dimming overlay, two extra close
  buttons, a logo, dividers, a second "Ask Coach Ruth" and a scroll lock. Rebuilt
  as live: a disclosure (`aria-expanded`/`aria-controls`) panel directly under the
  bar (+7px tablet / +9px mobile), 50px rows, 37px padding, caret beside the
  label, open parent in pink, children indented. Opening focuses the first item;
  Esc closes and returns focus to the hamburger (it used to return to whatever
  was focused before, often nothing).
- **Dropdown wrapped long labels.** Labels are now one line and the panel grows
  to the longest (Resources 268px; live 276px with its fonts).

## Known differences (owner-approved)
- Header search toggle; dropdown min-width 220px.

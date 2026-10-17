# Phase 6: Interactions and forms

**Goal:** Every interactive behaviour on live works the same way. JS is small, progressive and accessible.

**Skills:** `deploying-emdash-cloudflare` (forms + Turnstile), `building-emdash-site`, `agent-browser`; Resend docs via Context7.

**Spec source:** the "Interactions" section of each file in `migration-plan/page-maps/`.

## 6.1 Navigation
- Desktop dropdowns: hover **and** keyboard (focus-within, Esc closes), with the same open animation/timing as live
- Mobile menu: hamburger → panel, the same look as live (`states/` screenshots), submenu toggles, focus trap, Esc, scroll lock
- Sticky header: same trigger offset and shrink/shadow as live
- Marquee: CSS animation at the measured speed; pauses on hover if live does; `prefers-reduced-motion` stops it

## 6.2 Carousels (D8)
Hero slider, services, testimonials, resources and posts, per `page-maps/_global.md` → Carousel and `home.md`. The slider JS loads only on pages that have a carousel. With JS disabled, the first slides still show.

## 6.2b Sticky elements
Main header bar (all devices); `ListingRow` image columns (desktop + tablet, sticky within their row); blog sidebar (desktop + tablet). Use CSS `position: sticky`, not JS.

## 6.3 Service booking off-canvas (D5)
"Book Service" opens a **centred modal** (70vw × 90vh, radius 30, 80% black overlay; full spec in `page-maps/single-service.md`). It contains the confidentiality and cancellation policy text (from the two policy **pages**, so editors change it in one place), the "I agree to the Confidentiality Policy and Cancellation Policy" checkbox, and a "Book Now" button: grey until checked (clicking it flashes the agreement row red 3×), white/pink once checked, then it goes to the service's `booking_url`. Clicking the policy names scrolls the modal to that section. Accessible: `role="dialog"`, `aria-modal`, focus trap, Esc closes, focus returns to the trigger.

## 6.4 Ask Coach form (D4) 🧑 Gate G3
Fields: Category (select: Love, Dating, Marriage, Sex, Faith, Life), Question (textarea, required), Send. Styled like live.
1. Check whether the installed EmDash has a forms feature (docs + `deploying-emdash-cloudflare`). Use it if so; otherwise use an Astro action with zod (`.nullish()` for optional fields, AGENTS.md trap 8).
2. Turnstile (managed widget). Test with the always-pass keys in automation; test the real keys in a real browser.
3. Deliver via **Resend** (REST `POST https://api.resend.com/emails` with `fetch`; secret `RESEND_API_KEY`) to `askcoach_recipient` = `admin@ruthsmarriage.com`, from a sender on the verified `ruthsmarriage.com` domain (e.g. `Ask Coach <askcoach@ruthsmarriage.com>`). Subject `Ask Coach: <Category>`; the body has category + question, and no submitter identity (the form is anonymous). Show the same success/error messages as Elementor, including the anonymity note. Also store each submission in EmDash if forms support it, so nothing is lost if email fails.
4. Rate-limit per IP (e.g. 5/hour).
5. The marquee renders every published `marquee_items` entry in `order`, separated as on live (see the header page map).

**G3:** ask the human for the Resend API key + domain verification (Resend gives the DNS records; add them in the Cloudflare zone **only with the human's approval**, and leave existing MX records untouched), the Turnstile keys, and the YouTube channel URL. Until then, use `TODO(G3)` and keep the form disabled in production.

## 6.5 Search
The Inspired Features page search widget and `/search/` use EmDash `search()` across posts (and resources/services if live search returns them; it does return resources).

## 6.6 Video embeds
`/videos/` and video resources: lite YouTube embed (thumbnail → iframe on click) that looks identical to the Elementor video widget's poster state.

## Acceptance checks
- agent-browser scripted run: open each dropdown, the mobile menu, the booking off-canvas (checkbox gating works, Book Now goes to the Selar URL), submit Ask Coach with test keys → success message and email received (or the provider log shows it)
- Keyboard-only walkthrough of the same flows; no console errors
- Commit `phase-06: interactions + forms`

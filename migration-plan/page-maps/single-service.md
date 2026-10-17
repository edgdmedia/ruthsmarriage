# Single service `/service/{slug}/` (Elementor single template 143)

Reference: `discovery/screenshots/live/single-service-*.png`, plus `states/booking-offcanvas-*.png`, `booking-offcanvas-bottom-*.png`, `booking-offcanvas-agreed-*.png`. Sample: `/service/one-hour-couples-counseling-session/`.

| Section | 1440 | 1024 | 390 |
|---|---|---|---|
| Main `d355bcc` | 137+900 | 137+1000 | 128+973 |
| Footer | 1037+486 | 1137+503 | 1100+1099 |
| **Page** | 1523 | 1640 | 2199 |

## Main section (`d355bcc`)
- Full width, bg **`#BF1E7224`**, **`min-height: 100vh`**, flex **row**, padding `0 10px`. Boxed 1140.
- @≤1024: `flex-direction: column`, padding **50px** (**20px** @≤767).

**Image column** (`2aecb79`): ~48% (544px), padding 20px, vertically centred. Image: service `featured_image` at its natural square aspect (504×504 @1440), no border or radius. **@≤1024 the img is fixed at 357px wide**, centred.

**Text column** (`c7440ca`): ~52% (576px), padding **50px** (20px @≤767), vertically centred, all text centred, 20px gaps:
1. **Term pill**: `service_type` name (e.g. "Married") linking to `/service-type/{slug}/`. Pill bg `#BF1E72`, padding `1px 5px 0`, radius 20px, self-centred. Icon `fas-dot-circle` 11px white with a 4px gap, text system font **11px/16.5px white**, padding-bottom 2px. Size 65×26.
2. **h1 title**: Nunito **700 24px/24px `#444547`**.
3. **Price** (`price_label`, e.g. "₦160,000/$160"): Poppins **600 16px/16px `#BF1E72`** (an h6 on live).
4. **Audience label** (`audience_label`): Poppins 400 **italic 17px** `#000`, `margin-top: -10px`. Hidden if empty.
5. **Format** (`format`): Poppins **600 16px** `#000`.
6. **Description** (`content`): Poppins 400 16px/24px `#2E2E2E`.
7. **Notice** (`notice`): Poppins **700 13px/19.5px** `#2E2E2E`: "After clicking "Book Service," you'll be guided to our policy page before proceeding to the payment section, where you can choose your preferred currency and complete your booking." Store it in settings (same text on every service) with a per-service override.
8. **Button "Book Service"**: Nunito **600** 15px white on **`#ED0D82`**, padding 12px 24px, radius 20px. It opens the booking modal.

## Booking modal (Elementor off-canvas `0a5a571`) → `BookingModal`
**It's a centred modal, not a side drawer.**
- Overlay: fixed, full viewport, **`rgba(0,0,0,.8)`**. Click closes. No open animation (`no-animation`).
- Panel: centred, **width 70vw** (1008 @1440), **height 90vh** (810 @1440), bg white, **radius 30px**, `box-shadow: 2px 8px 23px 3px rgba(0,0,0,.2)`, **`overflow-y: auto`** (the content scrolls inside the rounded panel; the screenshot shows the scrollbar inside). Esc closes; focus trap; focus returns to the trigger.
- Content wrapper padding 30px. Sections:
  1. **Confidentiality Policy** block (`id="Confidentiality"`), padding `50px 20px`:
     - h5 "Confidentiality Policy": Nunito **600 24px/24px `#000`**, centred.
     - Divider: **47% wide, 2px solid `#BF1E72`**, centred, 4px vertical padding.
     - Body: the **Confidentiality Policy page content** (pulled from `pages/confidentiality-policy`, so it's edited in one place). Poppins 16px/24px `#2E2E2E`, left-aligned. Section headings inside are h4: Poppins **24px/28.8px** (500, with bold `<b>`), margins `8px 0 16px`. Paragraph spacing 14.4px.
     - The first paragraph is a bold notice: "Please scroll down to read our confidentiality and cancellation policy and check the "I agree" button to proceed."
  2. **Cancellation Policy** block (`id="Cancellation"`), padding `50px 20px 20px`: the same heading and divider styles, then the body from `pages/cancellation-policy`.
  3. **Agreement panel** (`ffe2aee`): bg **`#BF1E72`**, **radius 30px**, padding **30px**, `min-height: 70px`, content centred (column):
     - Row (`.policy-agreement`, padding 10px, margin-bottom 15px, `transition: border .3s`): a native checkbox (20px right margin) + label in the **system font 16px white**: "I agree to the **Confidentiality Policy** and **Cancellation Policy**". The two names are white, **600**, underlined (**800 on hover**). They scroll the modal to `#Confidentiality` / `#Cancellation`. Clicking a name must not toggle the checkbox.
     - **Book Now** button (system font 16px, padding `10px 30px`, radius 20px, no border):
       - **Unchecked**: bg `#CCCCCC`, text `#CC3366`, `cursor: not-allowed`. Hover: bg transparent, `1px solid #FFF` border, white text.
       - **Checked** (`.active`): bg **white**, text **`#BF1E72`**, pointer.
       - Click while unchecked: **flash** the agreement row with a `2px solid red` border, toggling every 300ms, 6 times. Click while checked: navigate to the service's `booking_url` (Selar) in the same tab.
- At 390 the panel is 70vw × 90vh too (≈262px wide), so the text column is very narrow (138px of text on live). Match it.

## Data
`services`: `featured_image`, `price_label`, `audience_label`, `format`, `content`, `notice` (optional override), `booking_url`, `service_type` term.

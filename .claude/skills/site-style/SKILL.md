---
name: site-style
description: MannaFlow visual style guide — palette, typography, section recipes, and component patterns. Use whenever creating or restyling any page, section, card, button, or form on this site so new UI matches the existing look exactly.
user-invocable: false
---

# MannaFlow style guide

Everything on this site is built from a small set of recipes. Reproduce them; don't invent parallel ones.

## Palette (source of truth: `@theme` in app/globals.css)

| Role | Token | Hex |
|---|---|---|
| Nav/footer surface | brand-charcoal | #14181A |
| Dark photo-section backdrop | brand-ocean | #081924 |
| Mobile hero base | brand-ink-deep | #101B1B |
| Page background / light text on dark | brand-cream | #F5F2EC |
| Light alt surface | brand-sand | #EAE5D9 |
| Body text on light | brand-ink | #212926 |
| Muted text on light | brand-mid | #627C85 |
| **CTA button fill** | brand-forest | #12633B (hover #0F5533) |
| **Headline accent words** | brand-green-accent | #228754 |
| **Eyebrows/labels/dashes on dark** | brand-sage | #528562 |
| **Carousel accents on dark** | brand-mint | #5FB187 |
| Legacy bright CTA (`.btn-primary` only) | brand-emerald | #32DE8A |
| Warm accent / FAQ marker | brand-amber-deep | #A65F28 |
| Headline on dark sections | — | #F3EFE6 |
| Sub/body on dark sections | — | #A6BBB3 / #B7C6C0 |
| Hairlines | hairline-light / hairline-dark | #DDD5C6 / #2A3134 |

Never introduce a new green, cream, or charcoal. If a shade seems missing, pick the nearest above.

## Typography

One font: MontaguSlab variable (self-hosted). Always pair `font-weight` with a matching `'wght'` in `font-variation-settings`, and set `'opsz'` (24 small text → 120 display).

Use the existing classes from globals.css instead of raw CSS where possible:
- `type-display` — hero-scale, weight 200, clamp(2.75rem→6rem)
- `type-headline` — section headings, weight 600, clamp(1.75rem→2.5rem)
- `type-subhead` / `type-body` — running text, weight 400
- `type-eyebrow` — 0.9rem, weight 700, letter-spacing 0.22em, uppercase (section labels)
- `type-label` — 0.7rem utility label, spacing 0.2em
- `type-card-title` — 1.25rem, weight 600
- `type-stat` — giant thin numbers, weight 100

## Buttons

- Primary CTA on current pages: forest fill — see `.mf-hero-cta--primary`, `.mf-book-submit`, `.mf-demo-cta` (#12633B, cream or ink text, border-radius 10px, uppercase, weight 700, letter-spacing 0.04–0.06em).
- Secondary on dark: transparent + 1px cream border (`.mf-hero-cta--secondary`, `.btn-ghost`).
- On light: `.btn-outline-dark`. Legacy `.btn-primary` (bright emerald) — don't use for new UI unless matching a page that already does.
- Pill CTA inside dark cards: `.mf-hwh-card-cta` (999px radius, mint border, uppercase 0.72rem).

## Section recipes

**Dark photo section** (Gap, How We Help, Book): `background-color: #081924` + photo from `public/pictures/new/` behind a dark gradient overlay; content = sage eyebrow → centered cream headline (max-width ~20ch) → muted sub (max-width ~46ch) → cards.

**Card on dark:** `background: rgba(8,20,30,0.72)`; border `1px solid rgba(95,177,135,0.18)` (mint hairline); `border-radius` 14–18px; `backdrop-filter: blur(3-4px)`. Active/hover: bg to rgba(11,25,35,0.9), border alpha to ~0.45, soft green glow shadow.

**Section joins:** `<SectionNotch from="#hexOfSectionAbove" />` or the `.mf-bridge` overlap card (forest fill, translateY(-50%)).

**Carousel pattern:** see `.mf-hwh-*` (small cards) / `.mf-demo-*` (tall demo panels) — absolute-positioned cards with `is-active/is-prev/is-next/is-far` classes, swipe via pointer events, dots + circular arrows outside the card edge.

## Hard rules

- Mobile (<768px) is the reference visual — see Rule #1 in AGENTS.md. One breakpoint: 768px.
- Every animation gets a `prefers-reduced-motion: reduce` fallback.
- New styles with a mobile/desktop split go in globals.css as a commented `/* ---- Section ---- */` block: mobile base first, then `@media (min-width: 768px)` overrides. No new inline `style={{}}`.
- Forms: `.form-input` / `.mf-book-input` recipes (cream #FFFDF8 field, hairline border, amber focus ring).

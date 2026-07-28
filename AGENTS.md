# MannaFlow marketing site — agent guide

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## ⚠️ Rule #1: Mobile and desktop are separate deliverables

The mobile layout (iPhone, < 768px) is the owner's reference visual and is pixel-matched to design mocks. **A change requested for one viewport must not alter the other.** The site's single breakpoint is **768px** everywhere (Tailwind `md:` == the CSS `@media (min-width: 768px)` blocks).

- CSS is mobile-first: base rules = mobile, desktop overrides live inside `@media (min-width: 768px)` blocks in `app/globals.css`.
- **Mobile change → edit base rules only. Desktop change → edit only inside the `min-width: 768px` block.** Never edit a rule that applies to both viewports unless the user explicitly asks for both.
- In TSX, unprefixed Tailwind classes affect mobile AND desktop; `md:`/`lg:` prefixes affect desktop only. To change mobile without touching desktop, you often must ADD a `md:` class pinning the current desktop value before changing the base class.
- The hero (`.mf-hero-*`) uses absolute pixel offsets tuned to a 404px-wide reference mock. Do not "clean up" or convert these to flex/grid.
- After any layout/style change, verify BOTH viewports: 390×844 and 1280×800 (use `/responsive-check`). Only the requested viewport may differ from before.

## Commands

- `npm run dev` — dev server on :3000 (often already running — check before starting another)
- `npm run build` — production build (also the full typecheck)
- `npm run lint` — ESLint

## Dashboard handoff

For the local dashboard database, seeded demo account, environment separation,
and required multi-tenant follow-up work, read
[`docs/DASHBOARD_DEVELOPMENT.md`](docs/DASHBOARD_DEVELOPMENT.md) before making
dashboard/auth/data-model changes.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 (CSS-first config via `@theme` in `app/globals.css` — there is no `tailwind.config`) · TypeScript · Resend (contact email) · Retell (live voice demo). Font: **MontaguSlab variable** only (self-hosted in `public/fonts/`, loaded via `@font-face`; Georgia fallback). No other font is used anywhere.

## Site map

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Landing: Nav → Hero → SectionNotch → AgencyIntro → ProblemStatement → LeadLeak ("The Gap" stats) → HowWeHelp (card carousel) → FAQ → Contact → Footer |
| `/demo` | `app/demo/page.tsx` | Interactive product demos (carousel of `components/demos/*`) |
| `/how-it-works` | `app/how-it-works/page.tsx` | Process explainer |
| `/book-demo` | `app/book-demo/page.tsx` | "Book a Call" — dark ocean section + floating cream form card |
| `/contractors` | `app/contractors/page.tsx` | Contractor-specific landing |
| `/api/contact` | `app/api/contact/route.ts` | Contact form → Resend email |
| `/api/demo-call` | `app/api/demo-call/route.ts` | Starts Retell voice demo call |

Section nicknames: "the Gap" = stats cards over the wave photo (`components/LeadLeak.tsx`, `.mf-gap-*`); "How We Help" = stacked card carousel (`components/HowWeHelp.tsx`, `.mf-hwh-*`); "the notch" = green rule/tab divider (`components/SectionNotch.tsx`).

Every component under `components/` and `components/demos/` is live — dead code was purged deliberately; don't add speculative components.

## Styling system

Three mechanisms coexist. Which to use:

1. **Custom `.mf-*` / `type-*` / `btn-*` classes in `app/globals.css`** — for anything with a mobile/desktop split, animation, or pseudo-elements. Primary system; each section has a commented block (`/* ---- Section name ---- */`): mobile base rules first, then the `@media (min-width: 768px)` overrides.
2. **Tailwind utilities in TSX** — simple spacing/layout in sections that already use them.
3. **Inline `style={{}}`** — legacy; do not add new ones.

**Colors:** the `@theme` block at the top of `app/globals.css` is the source of truth (dark surfaces, cream/sand lights, and the green family: `forest` #12633B CTA fills · `green-accent` #228754 headline accent words · `sage` #528562 eyebrows/labels on dark · `mint` #5FB187 carousel accents). Much of the codebase still uses raw hex — when touching a color, use the token value; never invent a new green/cream/charcoal.

**Type scale:** use the existing classes — `type-display`, `type-headline`, `type-subhead`, `type-body`, `type-eyebrow` (uppercase section labels), `type-label`, `type-card-title`, `type-stat` (giant numbers). All set `font-variation-settings` for optical size + weight; when writing raw CSS text styles, always set both `font-weight` and a matching `'wght'`.

**Section anatomy** (dark photo sections like Gap / How We Help): sage eyebrow → centered cream headline (`#F3EFE6`) → muted sub (`#A6BBB3`) → translucent cards (`rgba(8,20,30,…)`, green hairline border, backdrop-blur). Sections join via `SectionNotch` (pass the hex of the section above) or the `.mf-bridge` overlap card.

**Motion:** every animation needs a `prefers-reduced-motion: reduce` fallback — see existing patterns at the bottom of globals.css.

## Assets

- `public/pictures/new/` — current section background photos (hero ocean mobile/desktop, gap bg, how-we-help bg)
- `public/logos/` — integration marquee logos; `logo/` (repo root) — brand logo sources
- `public/fonts/` — MontaguSlab variable font

## Env

`.env.local` (never commit): Resend + Retell keys. API routes fail without them, but forms can still be layout-tested keyless.

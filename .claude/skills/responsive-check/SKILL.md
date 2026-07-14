---
name: responsive-check
description: Verify a page change on both mobile (390px) and desktop (1280px) viewports and confirm the viewport that was NOT being edited is unchanged. Run after any layout or style change to this site.
---

# Responsive check

Mobile (<768px) is the owner's reference visual. This check enforces AGENTS.md Rule #1: a change aimed at one viewport must not alter the other.

## Steps

1. Determine which page(s) the current change affects (default: `/`) and which viewport the change was *for* (ask the user if genuinely ambiguous; default assumption: the change was desktop-only, mobile must be untouched).
2. Ensure the dev server is up: check `http://localhost:3000` first — the owner usually has `npm run dev` running. Only start one if nothing responds.
3. For each affected page, using the Browser pane:
   - Resize to **390×844**, load the page, screenshot the changed section (scroll to it) and any section that shares CSS with it (e.g. both carousels share the position-class pattern).
   - Resize to **1280×800**, repeat.
4. Compare each screenshot against the pre-change state (if you edited in this session, compare to your memory of the baseline; if unsure, `git stash` → screenshot → `git stash pop` → screenshot → compare).
5. Report: for the viewport that was being edited, confirm the change looks as intended; for the other viewport, explicitly state "unchanged" or list every difference found.
6. Any unintended difference on the protected viewport is a blocker — fix it before finishing, typically by scoping the CSS to the correct side of the 768px breakpoint (base rules = mobile, `@media (min-width: 768px)` = desktop).

## Notes

- The hero's mobile layout uses absolute pixel offsets (`.mf-hero-*` base rules) tuned to a 404px mock; tiny text reflows there are NOT acceptable collateral.
- Also glance at the browser console for new errors after loading each page.

---
title: Homepage V2
description: Redesign of the Introduction landing page around a task-first layout and an Ask Stellar entry point.
author: minkyeong
date: 2026-09-08
status: exploring
---

## What this proves

That the Introduction page works better as a **navigation surface than a
marketing page**. v2 replaces the hero CTAs, the four-card slider, and the
resources block with three dense, scannable card grids (Start building, Explore
& inspect, Network) plus a new Ask Stellar entry point at the top.

The open question it answers: can a first-time visitor find the thing they came
to do without scrolling past a pitch? Every destination is now reachable in one
click from above the fold or one screen below it.

Built from Figma node `9477:68721`.

## What it doesn't cover

**Nothing is wired up.**

- **Ask Stellar answers, but there is no API.** The input, the suggestion rows,
  and the panel's own composer all work — they open the panel and append user
  bubbles — but every reply is hand-written. Each of the three suggestions has
  its own on-topic answer and action buttons (deploy → Deploy contract, XDR →
  View XDR, debug → Transaction dashboard), keyed by the exact suggestion text
  in `mock-data.ts`. **Anything typed freehand falls back to the deploy reply**,
  so a typed question will usually be answered off-topic. Nothing is requested
  or streamed, and multi-turn is visual only.
- **The conversation is not persisted.** Closing the panel discards it.
- **The floating Ask Stellar pill is not on the home page.** Both the Ask
  Stellar input and the suggestion rows open the chat panel, which made the
  pill redundant here. `components/AskStellarPill/` is kept for use on other
  pages, and still has no behaviour of its own.
- **Network switching is a no-op.** The active network is read from the real
  store (so the "You're on X" state is genuine), but the Switch buttons do
  nothing. Production's switch-confirmation modal is gone from the design with
  nothing specified to replace it.
- **Tutorials don't play inline.** The three cards are static screenshots that
  link out to YouTube. Production embedded a live iframe with a 20-item
  scrollable list; v2 shows three and links to the playlist.

**Assets**

- **Dark variants do not exist.** The four remaining rasters (three tutorial
  thumbnails plus the save/share art) are light-only. Image handling is
  structured as a theme-keyed lookup (`mock-data.ts`, `ThemedImage`) mirroring
  production's `-${imgTheme}` convention, and `dark` currently resolves to the
  light file. When the designer exports dark assets, add the import and change
  one value per entry — no consumer changes.
- **`save-share-composite-light.png` is a 1x placeholder.** §7's art is a live
  Figma composition of real component instances, not an exportable asset, so it
  was captured as a 591x179 render. It is soft on retina. The designer is
  exporting a 2x.

**Known issues**

- **The Ask Stellar gradient label is unreadable in dark mode.** The gradient
  (`#8d7ce2 → #241d49`) is a fixed value approved for light mode, so its dark
  end lands on a near-black background and "Ask" all but disappears. Needs
  either a theme-aware second stop or a dark-mode override. Left as designed
  rather than invented.
- **Responsive behaviour is invented.** The Figma is desktop-only at 1440 with
  no breakpoints. Grids collapse 4→2→1 (and 3→2→1) at 900px and 560px, and §7
  stacks at 900px. Those numbers need design input before they mean anything.

**Deliberately dropped from the current page**

The slider and the Resources block (YouTube, Discord, Stellar Quest, X,
Developer Docs) are gone with no replacement slot, per design direction.

## Design system notes

Per `rules/02-styling.md`, gaps flagged rather than worked around:

- **Ask Stellar is off-token by design**, confirmed with the designer: 3px
  `#544a89` border, 24px radius, gradient-filled label. SDS `Input` was not used
  because none of its chrome survives the overrides.
- **SDS line-heights run 2px looser than Figma** on body text — `Text size="sm"`
  is 14/22 against Figma's 14/20, `size="xs"` is 12/20 against 12/18. Tokens
  used as-is; cards are a few px taller than the comps.
- **No 36px button.** Figma's network buttons are 36px; SDS has md=32 and lg=40.
  Used md.
- **No borderless button variant.** All six SDS `Button` variants set
  `--Button-color-border-default`, so "View all tutorials" neutralises the
  border and background variables locally rather than rebuilding the button.
- **No shadow or radius tokens in SDS.** The Ask Stellar panel's
  `0 4px 10px rgb(0 0 0 / 25%)` shadow and its 24px/16px/4px radii are local
  `pxToRem` values.
- **`white` is not a safe literal.** The panel composer reads as `bg-white` in
  the export, but `--sds-clr-base-00` is theme-aware and flips to `#000000` in
  dark mode. Used `gray-01` instead — indistinguishable in light, correct in
  dark.

The panel's colours are otherwise all tokens: user bubble `lilac-03`
(`#f5f2ff`), assistant bubble `gray-03`, and both action buttons are plain SDS
`Button` at `size="md"` — `variant="secondary"` and `variant="tertiary"` match
the export's fills, borders, and metrics with no overrides.
- **Border radii and card padding** (6px, 24px, 4px) have no SDS token and live
  in local SCSS via `pxToRem`.

Everything else maps exactly: `--sds-clr-lilac-*` covers the brand ramp
(`lilac-11` = `#5746af`), `--sds-clr-green-09/11` cover the success colours,
`--sds-clr-gray-*` covers every neutral, and `Heading size="md" weight="medium"`
is 40/48 with -1.6px tracking with no overrides.

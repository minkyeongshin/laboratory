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
The panel minimises rather than closing. Conversation and visibility are
separate pieces of state, so:

- No conversation yet → no pill, no panel.
- First question → panel opens and the pill appears beneath it.
- Close X or Escape → panel hides, messages kept, pill stays.
- Pill → toggles the panel back open with history intact.

The pill is visible whenever a conversation exists, including while the panel
is open, which is how the Figma frame shows it.
- **The conversation only lives for the session.** Closing the panel minimises
  it — messages are kept and the pill reopens them — but a reload starts over.
  Nothing is persisted to storage or the querystring.
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

## Type ladder

A designer decision, applied everywhere. All SDS sizes, no overrides.
**Two body sizes total: 14px for anything you read, 12px for meta.**

| Role | Size | Weight | Colour |
|---|---|---|---|
| Page h1 | `Heading size="md"` (40/48) | medium | gray-12 |
| Hero subtitle | `Text size="md"` (16/24) | regular | gray-11 |
| Section title | `Text size="lg"` (18/26) | medium | gray-12 |
| Section description | `Text size="sm"` (14) | regular | gray-11 |
| Card title — *every* section | `Text size="sm"` (14) | medium | gray-12 |
| Card description — *every* section | `Text size="sm"` (14) | regular | gray-11 |
| Meta — footer, commit hash, "You're on X" | `Text size="xs"` (12) | — | gray-11 |

**Inside a card, gray-12 is the title only.** Every description and secondary
line is gray-11, in all sections. This was previously wrong in Explore & inspect
and Learn by building: both set `color: gray-12` on the whole `.CardGrid__cell`,
which inherited down onto the descriptions. Colour the title element, never the
cell — the components now carry explicit `__title` classes so the rule holds
structurally instead of relying on an override.

The h1's text top aligns with the **"Introduction"** nav item — the sidebar
entry for this page — so the page title sits on the same line as the item that
leads to it. That needed the shared container's 32px top padding zeroed for this
prototype; `__column` carries the whole 75px offset instead.

**Hero spacing** is a deliberate hierarchy rather than one uniform rhythm, so
the block reads as grouped:

| | |
|---|---|
| h1 → subtitle | 16px |
| subtitle → Ask Stellar label | 40px |
| label → input | 8px (a label hugs its field) |
| input → chips | 12px |
| chips → first section | 96px — the largest gap on the page |

## Patterns

### Explore & inspect — column dividers

Uses **`CardGrid variant="open"` — one component, two densities.** Same column
math, 1px `gray-06` gap dividers and 24px cell padding as the Start building
row, without the outer border and radius. Deliberately lighter than the action
cards above it, but visibly the same family, so the section is anchored rather
than floating between two bordered grids. Each cell is a single link (tile + one
inline paragraph); tile hover takes the border to `lilac-11`.

The open variant keeps its border at **1px transparent** rather than removing
it, so the column math and the 24px content inset stay identical to the bordered
variant — that is what lands both rows on the same left edge (measured: Explore
tile left = Start building card text left = 413px, exactly). `background-clip:
padding-box` keeps the `gray-06` fill off that transparent border so it shows
only through the column gaps.

An earlier version reimplemented the dividers locally as pseudo-elements in the
grid gap. That worked, but duplicated `CardGrid` and left the tiles flush with
the section title while the cards' text was inset 24px. Reusing `CardGrid`
removed the duplication and fixed the inset in one move.

Section spacing matches Start building exactly — 16px from the section title to
the content in both, so the two rows share a rhythm despite the different
treatment. (Measured: 16px box-to-box, 19px from the title's text baseline.)

**Two variants were tried.**

- **A — tinted panel.** `gray-02` field, radius 16, padding 32, no border, with
  the tiles kept `gray-01` so they lift off it. **Rejected:** it anchored the
  section, but introduced a second surface treatment the page doesn't otherwise
  use — every other block is either a bordered `gray-01` card or plain page —
  and it cost 64px of height while narrowing the columns to 200px.
- **B — column dividers.** *Chosen,* because it reuses the `CardGrid` rule
  rather than inventing a new surface. The section is anchored by a language
  already on the page, adds no height, and gives the widest columns of any
  option tried.

### Suggestion chip

**40px, weight 500, 8/12 padding. Intentionally NOT SDS `Button` (32/600):**
chips fill the input rather than navigate, and must read differently from the
action buttons elsewhere on the page. **If this pattern appears on a second
surface, propose it to SDS.**

Weight 500 is the deliberate middle of the ladder — 400 read as a label rather
than something pressable, and 600 (SDS `Button`) made a row of chips compete
with the input above them. 500 matches the card titles: the name of something
you can press.

Audited against `Button variant="tertiary" size="md" isRounded`, which shares
the colours and shape but differs in four ways — height 32 vs 40 (fixed by
`--Button-height`), padding 6/10 vs 8/12, weight 600 vs 500, and hover `gray-04`
vs `gray-02`. Adopting it would mean overriding all four, which is most of the
component.

The other two pill-shaped elements on the page:

- **"Ask" button** — stock SDS `Button variant="secondary" size="md" isRounded`.
  No overrides.
- **`AskStellarPill`** — local, because its label is gradient-filled via
  `background-clip: text` and SDS `Button` paints its own colour over the label.
  Its metrics still match SDS `md` (32px tall, 14px), differing only by 2px of
  horizontal padding and a lilac border that ties it to the Ask Stellar block.

## Design system notes

Per `rules/02-styling.md`, gaps flagged rather than worked around:

- **Ask Stellar is off-token by design**, confirmed with the designer: a 3px
  gradient stroke, 24px radius, and a gradient-filled label. SDS `Input` was not
  used because none of its chrome survives the overrides.
  - An earlier note here called the border a solid `#544a89`. That was wrong:
    the stroke is a gradient in Figma, and the MCP export flattens it because a
    CSS `border` cannot take one. `#544a89` is that ramp sampled at the stroke's
    midpoint — sampling `rgb(141,124,226) → rgb(36,29,73)` at 54% (the visible
    span, given stops at 33.9% and 155.4%) gives `rgb(84,73,143)` against the
    export's `rgb(84,74,137)`. Nobody chose that colour. It is now drawn as a
    real gradient via the padding-box/border-box background trick, so **no raw
    hex is left in the prototype.**
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

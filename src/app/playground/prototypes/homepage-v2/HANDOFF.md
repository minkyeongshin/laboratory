# Homepage V2 — engineering handoff

Read this before touching the prototype. `README.md` is the design record; this
is the "what you're actually inheriting" document.

Branch: `prototype/homepage-v2`. Built from Figma node `9477:68721`
(page) and `9478:70856` (Ask Stellar panel).

---

## 1. What this is

A redesign of the Introduction landing page as a **navigation surface rather
than a marketing page**: a hero with an Ask Stellar entry point, then four
sections (Start building, Explore & inspect, Network, Learn by building) and a
Save & share block. It is a working, clickable prototype at
`/playground/prototypes/homepage-v2` — it is not a feature.

**What is real:** layout, typography, tokens, routing (every card and link goes
to a real route), the active-network read from the production Zustand store, and
the Ask Stellar conversation's persistence mechanics.

**What is mock — be under no illusions:**

- **Every Ask Stellar reply is hardcoded.** Three canned answers keyed by the
  exact suggestion text; anything typed freehand gets the deploy answer. No
  request is made, nothing is streamed, and the reply ignores the question.
- **Network switching is a no-op.** The card reads the real active network, so
  "You're on Testnet" is genuine, but the Switch buttons do nothing. Production's
  switch-confirmation modal is absent from the design with nothing specified to
  replace it.
- **Tutorials don't play.** Three static screenshots that link out to YouTube.
  Production embedded a live iframe with a 20-item list.
- **The Save & share art is a flat PNG**, not a component — see §6.
- No analytics, no Sentry, no wallet interaction.

**Demo deployment convenience.** `vercel.json` at the repo root redirects `/` to
this prototype, so on the demo site the sidebar's "Introduction" item and the
logo land here rather than on the old home. It is a **307 (temporary)**, not a
308, so browsers don't cache it once the demo goes away.

Only Vercel reads `vercel.json`. Local `pnpm dev` and the production Lab (Docker
/ Next standalone) both ignore it — the file ships in the repo and the image but
nothing there reads it. **Delete it when the demo is done**; if this prototype
is ever promoted, the redirect is not the mechanism — the page moves to
`src/app/page.tsx` instead (see §4).

---

## 2. Ask Stellar — behaviour as built

### Entry points

| Entry | Behaviour |
|---|---|
| Hero input + "Ask" pill button | Appears once the field has text. Enter or click submits. |
| Suggestion chips (3, under the input) | Click submits that exact string. |
| Floating `AskStellarPill` | Appears once a conversation exists; toggles the panel. |

### Panel

Fixed bottom-right, 414×640, sitting 68px up so it clears the pill. Header
(gradient label + close), user/assistant bubbles, per-reply action buttons, and
a working composer at the bottom. Escape closes; focus moves into the panel on
open; the newest exchange scrolls into view.

**Closing minimises — it does not destroy.** Conversation and visibility are
separate state, so close (X or Escape) hides the panel and keeps the history;
the pill reopens it intact. Once a conversation exists the pill stays for the
rest of the session.

### Persistence

- Zustand store persisted to **`sessionStorage`** under
  **`lab.playground.askStellar`**. Holds `messages`, `isOpen`, and
  `hasVisitedPrototype`.
- Survives navigation (including onto production routes) and reload.
- **Clears when the tab or window closes.** A new tab starts empty. This is
  deliberate — `localStorage` would outlive the session.
- The store rehydrates at **module load** on the client, not in an effect: child
  effects run before parent effects, so a page marking itself visited would
  otherwise be clobbered by a later rehydrate in the layout.
- `AskStellarGlobal` gates on mount so the server render and the first client
  render agree.

### The flag gate

`AskStellarGlobal` is mounted in **`src/components/layout/LayoutMain.tsx`** —
the only production reference to playground code. It renders nothing until
`hasVisitedPrototype` is true, which is set the first time the prototype mounts
in a tab. Anyone who never opens the prototype sees nothing at all.

The flag lives inside the same persisted record rather than as a separate
`=1` key, to avoid a second storage mechanism for one boolean.

### File map

```
src/app/playground/prototypes/homepage-v2/
├── page.tsx                          # writes to the store; renders no panel/pill
├── store/askStellarStore.ts          # sessionStorage-backed Zustand store
├── mock-data.ts                      # all card copy + the canned replies
├── assets/                           # 6 files, light-only
└── components/
    ├── AskStellar/                   # hero input, "Ask" button, chips
    ├── AskStellarPanel/              # the conversation panel
    ├── AskStellarPill/               # minimised state
    ├── AskStellarGlobal/             # mounts panel + pill app-wide
    ├── CardGrid/                     # bordered + open variants
    ├── SectionHeader/
    ├── Hero/  StartBuilding/  ExploreInspect/
    └── NetworkPicker/  LearnByBuilding/  SaveAndShare/

src/components/layout/LayoutMain.tsx  # ← THE ONE PRODUCTION FILE TOUCHED
```

---

## 3. What a real implementation needs that this doesn't have

None of the below is decided. Nothing here should be inferred from the
prototype's behaviour — where it does something, it does it because a mock had
to do *something*.

**[PRODUCT DECISION] API contract.** Request and response shape, transport,
whether replies stream token-by-token or arrive whole. The panel currently
renders a complete string instantly; a streaming response changes the bubble
component and probably the scroll behaviour.

**[DESIGNER TO FILL] Loading, error, empty, and rate-limit states.** There is no
pending state, no failure state, no "you've hit a limit" state, and no first-run
empty state — the panel only ever opens with content already in it. All four
need designs.

**[PRODUCT DECISION] History limits and a "new conversation" affordance.**
History currently grows without bound and there is **no way to start a fresh
conversation short of closing the tab.** Needs a decision on a cap, and on
whether a reset control appears (the natural spot is beside the close X).

**[PRODUCT DECISION] Whether current-page context is sent with a question.**
Asking "why did this fail?" from `/transaction/submit` is a very different
product from asking it from the homepage. The prototype sends nothing.

**[PRODUCT DECISION] Auth — who can use it.** Anonymous visitors? Wallet
connected only? Rate limited by IP or by account? Not modelled at all.

**[PRODUCT DECISION] Does the panel overlay content, or push it aside?** Today
it is a fixed overlay in the bottom-right corner, floating above whatever page
you are on. The alternative is a docked rail that reflows the page. Overlay was
never chosen — it is simply what a prototype does most cheaply. It matters
because Ask Stellar is meant to be usable *while* working: an overlay covers
part of the form you are asking about, and on a transaction page that may be
exactly the part you need to see.

**[DESIGNER TO FILL] Mobile and responsive behaviour.** The panel is a
fixed 414×640 box with one invented breakpoint (full-bleed under 560px). There
is no tablet or mobile design for the panel, the chips, or the hero.

---

## 4. How to ship it

Roughly in order:

1. **Move the store out of the prototype path.**
   `homepage-v2/store/askStellarStore.ts` → `src/store/`. It already mirrors
   `createTransactionFlowStore.ts` (persist + `createJSONStorage(() =>
   sessionStorage)` + `skipHydration`), so this is a move, not a rewrite. Drop
   `hasVisitedPrototype` — see step 3. Rename the storage key off the
   `lab.playground.*` namespace.
2. **Move the components.** `AskStellar/`, `AskStellarPanel/`, `AskStellarPill/`,
   `AskStellarGlobal/` → `src/components/`. Their SCSS uses
   `../../../../../../styles/utils.scss`; the depth changes on the move.
3. **Remove the flag gate in `LayoutMain.tsx`.** Delete the
   `hasVisitedPrototype` condition in `AskStellarGlobal` and update the import
   path. **The mount points themselves stay as they are** — `LayoutMain` renders
   `<AskStellarGlobal />` in *both* branches (the app shell and the standalone
   `/playground` early return), which is already correct for production. Delete
   the `PROTOTYPE HOOK` comment block.
4. **Replace the canned replies.** `mock-data.ts` holds
   `mockAskStellarReplies` and `getMockAskStellarReply`; swap for a real query
   hook. Per repo convention use RPC (`src/query/useRpc*`), not Horizon — though
   this is likely a new backend rather than either.
5. **Decide what to do with the page itself.** If the redesigned Introduction
   ships, its sections move to `src/app/page.tsx` and `src/components/Home/`.
   The six original `Home/*` components were deleted here (`74fcef56`) and would
   need to be deleted in production too.
6. **Assets.** `mock-data.ts`'s `ThemedImage` map expects a `-dark` variant per
   entry; today `dark` resolves to the light file. See §6.

---

## 5. Design decisions, with reasons

Cited commits are on `prototype/homepage-v2`.

**Type ladder** (`70796a8e`) — two body sizes only: 14px for anything read, 12px
for meta (footer, commit hash, "You're on X"). h1 `Heading size="md"` 40/48;
section titles `Text size="lg"` medium; all card titles `size="sm"` medium; all
card descriptions `size="sm"` regular. **Inside a card, gray-12 is the title
only** — Explore & inspect and Learn by building had set `color` on the whole
cell, which inherited onto descriptions (7 elements wrong). Both now colour an
explicit `__title` element so the rule holds structurally.

**Suggestion chip: 40px, weight 500, 8/12 padding, not SDS `Button`**
(`f597381e`). Audited against `Button variant="tertiary" size="md" isRounded`,
which shares the colours and shape but differs in four ways — height 32 vs 40
(fixed by `--Button-height`), padding 6/10 vs 8/12, weight 600 vs 500, hover
`gray-04` vs `gray-02`. Adopting it means overriding all four. Weight 500 is the
deliberate middle: 400 read as a label, 600 competed with the input. **If this
pattern appears on a second surface, propose it to SDS.**

**`CardGrid` bordered + open** (`9d93e574`) — one component, two densities. The
open variant keeps its border at *1px transparent* rather than removing it, so
the column math and 24px content inset stay identical and both rows land on the
same left edge (Explore tile left = Start building card text left = 413px).
`background-clip: padding-box` keeps the divider fill off that transparent
border. **Hover differs deliberately: bordered cells hover as a whole; open
cells don't — the consumer decides** (`a852b62e`, a regression fix).

**Hero alignment** (`70796a8e`, `091a5ba3`) — the h1's text top aligns with the
**"Introduction"** nav item, so the page title sits on the line of the entry
that leads to it. Required zeroing the shared container's 32px top padding for
this prototype; `__column` carries the whole 75px. Hero spacing is a deliberate
hierarchy (16 / 40 / 8 / 12 / 96), not one rhythm.

**Rejected alternatives**

- **Tinted panel for Explore & inspect** (`b48da1b9`) — a `gray-02` field
  anchored the section but introduced a second surface treatment the page
  doesn't otherwise use, and cost 64px of height. Column dividers won because
  they reuse the `CardGrid` rule.
- **Hairline suggestion rows → chips** (`091a5ba3`) — the original Figma had
  full-width rows with 1px rules. Chips read as pressable and let the row wrap.
- **Illustrations in Explore & inspect** (`150c54d3`) — the first Figma export
  had 76×70 illustrations above each title; the designer dropped them, and the
  four assets were deleted. Now a 20px SDS icon, which is what distinguishes the
  section from Start building's title + arrow.
- **"Explore ›" links on every card** (`b48da1b9`) — four identical links
  carrying no information. The whole cell is the click target instead.

---

## 6. Known gaps

**In this prototype**

- **Dark mode assets don't exist.** The four rasters are light-only.
  `ThemedImage` in `mock-data.ts` is keyed by theme and `dark` resolves to the
  light file, so dark mode shows light artwork on dark cards.
- **The gradient label is unreadable in dark mode.** The Ask Stellar block and
  panel header use a fixed `#8d7ce2 → #241d49` ramp; the dark end lands on a
  near-black background and "Ask" all but disappears. Needs a theme-aware second
  stop or a dark override. Note the *pill's* label was changed to solid
  `lilac-11` (`853383bd`) — the other two were not.
- **Responsive breakpoints are invented.** The Figma is desktop-only at 1440.
  Grids collapse 4→2→1 at 900/560px and §7 stacks at 900px. Those numbers have
  no design behind them.
- **Save & share art is a Figma render, not a component.** `@3x` PNG (1773×537)
  of a live Figma composition of real product components. It will go stale the
  moment those components change, and it can't be themed. Rebuilding it in DOM
  is the real fix.
- **The hero has never been seen with an announcement banner above it.**
  `LayoutMain` early-returns for `/playground/*` without rendering
  `MaintenanceBanner` or `NetworkNotAvailableBanner`, so the prototype route
  never shows either. **A shipped home at `/` would**, and every judgement about
  the hero — the 75px top offset, the h1 aligning with the "Introduction" nav
  item, the 96px hero/content boundary — was made against a page with nothing
  above the header.

  The alignment itself should survive on inspection: banner and header sit in
  one block above both the sidebar and the content column, so the two shift down
  together. That is reasoning from the layout, not something anyone has looked
  at. What definitely changes is how much hero is above the fold, and
  `MaintenanceBanner` is expandable — its height changes on click, mid-page.
  Worth an explicit review pass with a banner present before shipping.

  On the Vercel demo the banner does appear on production routes reached from
  the sidebar. That was accepted rather than suppressed: the fetch in
  `useMaintenanceData` is a client-side call to a hardcoded third-party URL
  (`statuspage.io`), so no Vercel rewrite can intercept it, and making it fail
  would render `error.message` *as* a banner — worse than leaving it alone.
  Hiding it properly would mean making that URL env-configurable.

- The Figma file and the code diverge in two places the designer chose:
  page background is `gray-01` where the frame is bound to Background/Secondary,
  and the pill label is solid where the frame has a gradient.

**To raise with the SDS team**

- **`NetworkIndicator` Mainnet dot is `lime-09` (`#99d52a`); the design uses
  `lime-06` (`#c9e894`)** — noticeably more vivid than intended. The component
  is used as-is here; the delta was left alone rather than overridden.
- **`Text` line-heights run 2px looser than the design.** `size="sm"` is 14/22
  against Figma's 14/20, `size="xs"` is 12/20 against 12/18. Used as-is, so
  cards are a few px taller than the comps.
- **No borderless `Button` variant.** All six variants set
  `--Button-color-border-default`, so "View all tutorials" neutralises the border
  and background custom properties locally.
- **A `Tooltip` trigger cannot also be an action button.** `Floater` does
  `cloneElement(triggerEl, { onClick: toggleFloater })`, which **overwrites** the
  trigger's own `onClick` rather than composing with it. The panel's "New
  conversation" button silently did nothing until it was switched to a native
  `title`. Any icon button that both acts and needs a tooltip hits this.
- No shadow or radius tokens at all — the panel's shadow and the 24/16/8/6/4px
  radii are local `pxToRem` values.
- `li::before { content: "-" }` applies to every list item under the theme
  class, which has to be suppressed anywhere a real list is used for layout.

---

## 7. Figma-to-code pitfalls learned here

- **Gradient strokes flatten to a single hex.** A CSS `border` can't take a
  gradient, so the export emits the ramp sampled at the stroke's midpoint —
  `#544a89` for both the Ask Stellar input and the pill. Both are really 3px
  gradient strokes. Use the padding-box/border-box background trick.
- **Stroke alignment (inside/center/outside) is not in the export.** An outside
  stroke makes the visual box larger than the node's W×H. Here: **pill =
  outside, input = inside.** You can determine it without opening Figma by
  exporting the node and comparing bounds to its W×H — inside and outside differ
  by twice the stroke width.
- **`get_screenshot`'s `maxDimension` only scales down**, so it can never
  produce a retina asset. Use `download_assets` with `defaultScale`.
- **Gradient *text* is also flattened**, and `bg-clip-text` in the export is the
  tell.
- A fresh clone needs `pnpm dev` once before `pnpm lint:ts` — `next-env.d.ts` is
  gitignored and generated on first run (`25c228cb`).

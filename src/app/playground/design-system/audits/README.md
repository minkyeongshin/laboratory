# Playground audits

Five checks that were one-off Playwright scripts during the homepage-v2 build,
kept because each one caught something a careful read of the code did not.

```bash
pnpm playground:audit                       # all five, default prototype
pnpm playground:audit <url>                 # any prototype
node src/app/playground/design-system/audits/colors.cjs <url>   # one audit
```

Needs a dev server running. Each script prints a table and exits **0 on pass,
1 on fail**, so `run-all.cjs` works as a gate.

Common flags: `--root=<selector>` (audit root, defaults to `.HomeV2` →
`.LabLayout__content` → `main` → `body`), and per-audit flags noted below.

---

## The rules

### `colors.cjs` — card title / description colour

**Inside a card, gray-12 is the title only.** Every description and secondary
line is gray-11. Judges `font-weight >= 500` as a title, `< 500` as body, which
is how cards are written here (`weight="medium"` titles, regular descriptions).

Caught **7 wrong elements**: Explore & inspect and Learn by building had set
`color` on the whole `.CardGrid__cell`, which inherited gray-12 onto their
descriptions. Both now colour an explicit `__title` element.

Flags: `--cards=<selector>` (default `.CardGrid__cell`).

> **Passes but looks suspicious:** *"You're on Mainnet"* is weight 500 and
> **not** gray-12 — it is green-11. The audit only judges colours in the gray
> ramp and skips accents, reporting them in the `skipped` count. If that line
> ever gets flagged, the accent skip has broken, not the design.

### `orphans.cjs` — single-word last lines

A multi-line block whose last visual line holds one word. Lines are measured
from real client rects per word, so it reflects the actual wrap at 1440px rather
than an estimate from string length.

Caught 5 orphans across Network and Learn by building; fixed with
`text-wrap: pretty` rather than by rewriting approved copy.

Flags: `--text=<selector>`.

> **Passes but looks suspicious:** a one-word description like *"Payments."*
> reports `1 (n/a)` and passes. **A single-line block cannot orphan by
> definition** — there is no previous line for it to be stranded from. The audit
> counts these separately so a page full of n/a rows is visible rather than
> looking like a clean sweep.

### `type-ladder.cjs` — sizes on the ladder

Every rendered font-size must be one of **40** (h1), **18** (section title),
**16** (hero subtitle), **14** (body), **12** (meta). Two body sizes total: 14
for anything read, 12 for meta.

Weight is **reported but not enforced** — one size legitimately serves several
weights (a card title and its description are both 14).

Flags: `--sizes=40,18,16,14,12`.

> **Passes but looks suspicious:** *"Ask Stellar"* renders at **16px weight
> 600**, which is the hero-subtitle size at a weight nothing else uses. It is a
> component label with a gradient fill, deliberately off-ladder in treatment
> while on-ladder in size. The audit checks size only, so it passes — correctly,
> but do not read a green row as "this text follows the ladder in every
> respect".

### `raw-hex.cjs` — hex literals in SCSS

Colours belong to `--sds-clr-*`. Comments are stripped first, so a hex quoted in
an explanation does not count. **The only audit that reads files, not the page**
— it still takes a URL and derives the directory from the slug so `run-all` can
pass one argument to everything.

Flags: `--dir=<path>`.

> **Passes but looks suspicious:** `#544a89` is visibly present in
> `AskStellar/styles.scss` and `AskStellarPill/styles.scss`, yet the audit
> reports zero. Both occurrences are inside comments explaining that the MCP
> export flattened a gradient stroke to that value. Comment-only matches are
> excluded by design.
>
> **Known blind spot:** it matches hex only. The Ask Stellar gradient uses
> `rgb(141 124 226)` and `rgb(36 29 73)` in live declarations and is **not**
> caught. Those are real raw colours, signed off as off-token. Do not treat a
> green result as "no hardcoded colours".

### `alignment.cjs` — h1 against the sidebar

The page h1's text top should sit on the same line as the current sidebar nav
item, so the two columns begin together.

Both are measured as **text rects via `Range`**, not element boxes — boxes
include padding and half-leading, which differ between a 40px heading and a 14px
nav link and would make an aligned page read as misaligned. This is what turned
"looks about right" into a measured 0px.

Flags: `--nav=Introduction`, `--tolerance=1`.

> **Passes but looks suspicious:** the result is identical whether the page is
> scrolled or not. Both rects are viewport-relative and move together, so scroll
> cancels out. That is correct, not a stuck value.
>
> If the sidebar is collapsed or the nav label differs, the audit prints **SKIP
> and exits 0** — inconclusive, not a pass. Check for `SKIP` before reading a
> green run as alignment being verified.

---

## Adding an audit

Keep the shape: read `_lib.cjs` for `parseArgs`, `withPage`, `resolveRoot`,
`printTable`, `finish`. Register the filename in `run-all.cjs`.

Two things worth preserving:

- **Prefer measuring the page over reading the source.** Every rule here except
  `raw-hex` checks what actually rendered. The colour bug was invisible in the
  component — it came from a parent's `color` inheriting down.
- **Document what passes but looks wrong.** A green audit nobody trusts gets
  ignored; a green audit whose gaps are written down can be relied on for
  exactly what it covers.

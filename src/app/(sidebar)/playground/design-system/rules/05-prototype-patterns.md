# 05 — Prototype Patterns

How prototypes are organized inside this repo. Following the pattern makes prototypes findable, reviewable, and easy to throw away.

## Folder layout

```
src/app/(sidebar)/playground/
├── page.tsx                          # The gallery (Prototypes / Templates / Design System tabs)
├── prototypes/
│   ├── stellar-skills/
│   │   ├── page.tsx                  # The prototype itself
│   │   ├── README.md                 # What this prototype proves
│   │   ├── mock-data.ts              # All mock data, in one file
│   │   └── components/               # Prototype-only components
│   └── <next-prototype>/
├── templates/                        # Shipped patterns worth reusing
│   └── <template-name>/
└── design-system/
    ├── page.tsx                      # Renders rules + component catalog
    └── rules/                        # ← these markdown files
```

## Every prototype has a README

A short README at the top of each prototype answers four things:

```markdown
# <Prototype name>

**Author:** <name>
**Date:** YYYY-MM-DD
**Status:** exploring | reviewing | approved | shipped | archived

## What this proves

One or two sentences. What is the question this prototype answers?

## What it doesn't cover

Edge cases, error states, or flows intentionally skipped. Be honest.

## How to run

If it differs from the standard `pnpm dev`. Most of the time, just delete this section.
```

This is what gets distilled when someone (or Claude) inspects a prototype to understand its intent. Without it, prototypes become orphaned code nobody understands.

## Mock data

All mock data for a prototype goes in one file: `mock-data.ts`.

- Use the **same TypeScript types** the production code uses. Import from `src/types/` rather than re-declaring.
- Use the **same data shapes** production APIs return. If production returns `{ data: T, links: {...} }`, your mock should too.
- Use **realistic values** (see `03-content-voice.md`).
- Export mock query hooks that mimic the real React Query hooks:

```ts
// playground/prototypes/<name>/mock-data.ts
export const useMockTransactionList = () => ({
  data: MOCK_TRANSACTIONS,
  isLoading: false,
  error: null,
});
```

This way, when the prototype is approved, swapping `useMockTransactionList` for the real `useGetRpcTransactions` is a one-line change.

## Routes

Prototype routes live under `/playground/prototypes/<slug>`. The slug is kebab-case and short.

- ✅ `/playground/prototypes/stellar-skills`
- ✅ `/playground/prototypes/contract-explorer-redesign`
- ❌ `/playground/prototypes/MyNewIdea_v2_FINAL`

## Templates

A template is a shipped pattern someone might want to reuse. Examples:

- The standard "build → sign → submit" three-step flow
- The standard "input + validate + show error" pattern
- The standard data table with sorting

Templates have the same folder structure as prototypes but live under `templates/`. The README's "What this proves" section becomes "When to use this template."

## Design system entries

Each design system entry is a single page that shows one component in all of its variations on an otherwise empty page. The blog calls this the "isolated playground" pattern — it lets you focus on the component without page-level noise.

```
playground/design-system/
├── page.tsx                          # The Design System tab page
├── rules/                            # ← these files
└── components/
    ├── button/page.tsx               # All Button variants on one page
    ├── date-range-picker/page.tsx
    └── <next-component>/page.tsx
```

A component page should include:

- All variants (sizes, states, with/without icons, etc.)
- Edge cases (long labels, missing data, disabled states)
- Anti-examples if useful ("don't do this") with comments

## Naming

- Prototype slugs and folder names: **kebab-case**
- Component files: **PascalCase** (matches the rest of the repo — see root `CLAUDE.md`)
- Mock data exports: **camelCase**, prefix with `mock` (e.g. `mockTransactions`, `useMockTransactionList`)
- README files: always `README.md`

## What does not belong in a prototype

- Real API calls to Stellar networks (use mocks)
- Wallet connections (mock the wallet state)
- Production analytics / Amplitude / GA calls
- Sentry instrumentation
- New entries in the production sidebar nav (`src/constants/navItems.ts`)

If a prototype needs any of the above, that is a signal it has outgrown the prototype stage and should be promoted to a real feature.

## Archiving

When a prototype is shipped or abandoned:

- **Shipped:** delete it. The idea now lives in production code.
- **Abandoned:** move it to `playground/prototypes/_archive/` with a one-line note in its README about why it stopped. Do not leave dead prototypes in the active gallery.

The gallery should always be a list of live, reviewable ideas — not a graveyard.

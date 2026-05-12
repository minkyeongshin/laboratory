# 01 — Components

## Scope clarification

These rules apply to **prototypes inside `playground/prototypes/`** — code that explores features which may become part of the actual Stellar Lab product.

The **playground page itself** (gallery, tabs, search bar, "+ New" button, modal for creating prototypes) intentionally uses custom styling, not `@stellar/design-system`. This is by design — the playground is a separate tool surface with its own visual identity. Do not refactor the playground page to use design system components.

## The preference order

Use components in this exact order. Drop to the next level only after you can answer the question **"why does the previous level not solve this?"** in writing.

### 1. `@stellar/design-system` (always first)

Stellar has a real design system. Check it before anything else. Common components:

- **Inputs**: `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `RadioButton`, `Toggle`
- **Layout**: `Card`, `Modal`, `Container`
- **Feedback**: `Notification`, `Alert`, `Loader`, `Badge`
- **Data**: `Table`, `CopyText`, `IconButton`
- **Navigation**: `Tabs`, `Link`

Live reference: https://design-system.stellar.org/

If you cannot find a component in the design system, check the live docs first. Do not guess from memory — the design system evolves.

### 2. Existing components in `src/components/`

The repository has 50+ reusable components built on top of the design system. Examples:

- `AssetPicker`, `PubKeyPicker`, `XdrPicker`
- `WithInfoText`, `ValidationResponseCard`
- `OpenLink`, `ExpandBox`

Before building anything custom, search `src/components/` and `src/app/**/components/` with grep. If a component is 80% of what you need, extend it via props rather than copying.

### 3. Page-co-located components

For prototype-only UI that genuinely should not live in `src/components/`, place it under the prototype's own folder:

```
playground/prototypes/<name>/
├── page.tsx
└── components/
    └── MyPrototypeOnlyThing.tsx
```

This is fine for prototypes. Do not put prototype-only components in `src/components/` — that pollutes the production component surface.

### 4. Truly new shared components (rare)

Only after the previous three are exhausted. See `04-when-to-create-new.md` for the gate.

## Hard rules

- **Never use raw HTML inputs** (`<button>`, `<input>`, `<select>`) when a design system equivalent exists. Use `<Button>`, `<Input>`, `<Select>`.
- **Never re-implement existing components.** If a `Modal` exists, do not write your own.
- **Never use a different UI library** (Material UI, Chakra, Headless UI, Radix, etc.) inside the prototype. This is a hard line. The whole point is that prototypes match production.
- **Icons**: use icons that already exist in the design system or in `src/components/`. Do not add new icon libraries without writing down why.

## When in doubt

Ask Claude to grep for the component first:

> "Before you write a new dropdown, search `src/components/` and `@stellar/design-system` exports for anything that already does this."

Repetition of this question is how the design system stays usable.

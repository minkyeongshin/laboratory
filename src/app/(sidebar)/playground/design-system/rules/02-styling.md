# 02 — Styling

## The one rule

Use `@stellar/design-system` tokens and Sass. Nothing else.

## What this means in practice

### Allowed

- Stellar Design System components (they bring their own styling)
- SCSS files co-located with the component: `MyComponent/styles.scss`
- CSS variables exposed by the design system (see the live docs for token names)
- Layout primitives from the design system (`Container`, `Card`)

### Not allowed

- **Inline `style={}` attributes** — never. Not "just for the prototype." Not "I'll clean it up later."
- **New CSS frameworks** — no Tailwind, no styled-components, no Emotion, no CSS-in-JS additions, no Bootstrap.
- **Hard-coded color hex values** — use design system tokens. If a color is missing, that is a design system gap, not a license to hardcode.
- **Hard-coded spacing values in pixels** — use the design system's spacing scale.
- **Custom font imports** — the design system already loads fonts.

## File organization

Components with styles must be in their own folder:

✅ Correct:
```
MyComponent/
├── index.tsx
└── styles.scss
```

❌ Wrong:
```
MyComponent.tsx
MyComponent.scss   ← floating next to other files
```

This is also enforced by the production CLAUDE.md, so keep it consistent.

## Spacing and layout

The Stellar Design System exposes spacing tokens (small, medium, large, etc.). Use them. The design system's `Container` and `Card` already handle most layout needs.

For one-off layout (a grid of prototype cards on the gallery page, for example), use flexbox or CSS grid in SCSS — but use the design system's spacing tokens for the gaps.

## Dark mode

The design system handles light/dark. If you write custom SCSS, use the design system's CSS variables (e.g. `var(--color-text-primary)` rather than `#000`) so dark mode keeps working. Test both modes before declaring a prototype done.

## Animation

Keep it minimal. Use CSS transitions for hover/focus states. Do not add animation libraries (Framer Motion, GSAP, etc.) without writing down why an existing approach does not work.

## When you genuinely need a new token

If the design system is missing a value the prototype really needs:

1. Write down what it is and why no existing token works.
2. Use the closest existing token anyway for the prototype.
3. Flag it in the prototype's README as a design system gap.

Do **not** invent a new value in the prototype's SCSS and call it the new standard.

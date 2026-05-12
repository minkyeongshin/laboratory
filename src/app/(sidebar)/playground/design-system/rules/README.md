# Playground Design System Rules

These markdown files are the AI rules for building **prototypes** inside `src/app/(sidebar)/playground/`. They are not production code rules — see the root `CLAUDE.md` for that.

If you are an AI agent (Claude, Cursor, Copilot) working on a prototype, **read every file in this folder before you start writing code.** The files are short on purpose.

## When to use these rules

- ✅ Building or editing anything under `src/app/(sidebar)/playground/`
- ✅ Creating a new prototype from the gallery's "+ New" button
- ✅ Adding a template or design system entry
- ❌ Fixing production code outside `playground/` — use root `CLAUDE.md` instead

## Reading order

1. **`00-prototype-philosophy.md`** — what a prototype is and is not. Read first.
2. **`01-components.md`** — which components to use, in what order of preference.
3. **`02-styling.md`** — colors, typography, spacing, no inline styles.
4. **`03-content-voice.md`** — copy, tone, microcopy, empty states.
5. **`04-when-to-create-new.md`** — the rule that prevents component sprawl.
6. **`05-prototype-patterns.md`** — folder layout, mock data, routes, naming.

## The one rule above all rules

> Before creating anything new, answer in writing: **why can the existing thing not solve this?**

This applies to components, styles, helpers, utilities, types, and even new files. If you cannot answer it, do not create the new thing. Extend the existing one or reuse it as-is.

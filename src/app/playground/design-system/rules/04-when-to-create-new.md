# 04 — When To Create Something New

This is the most important file. The rest of the rules can be bent slightly. This one cannot.

## The gate

> Before creating a new component, file, helper, type, or pattern, you must answer:
>
> **"Why can the existing thing not solve this?"**
>
> If you cannot answer it in one or two sentences with specifics, you must not create the new thing.

This applies to AI agents and humans equally. It applies inside a prototype. It applies in the design system folder. It applies when refactoring.

## How to actually do this

When the instinct is "I'll just make a new X":

1. **Search first.** Grep `src/components/`, `src/app/**/components/`, and `@stellar/design-system` exports for the closest existing thing.
2. **Read the closest match.** Open the file. Look at its props and variants. Often it already does what you need.
3. **Try extending it.** Add a prop. Add a variant. The cost of one extra prop is almost always lower than the cost of a duplicate component.
4. **If extending genuinely does not work**, write down why in a comment at the top of your new component:

```tsx
// Created instead of extending <Button> because:
// - This needs an inline progress indicator that's tightly bound to async state
// - <Button> + loading prop would not show per-step progress
// - Extending <Button> with this would bloat its API for a one-off case
```

If you cannot write that comment honestly, you have not earned the new component.

## Common bad reasons (do not accept these)

- "It would be cleaner" — usually means "I want to write it myself"
- "I want to try a new pattern" — prototypes are for product ideas, not pattern experiments
- "The existing one has too many props" — that is a refactor concern, not a duplication license
- "The existing one's styling is slightly off" — fix the styling, do not duplicate
- "It's just for this prototype" — every duplicate started that way

## Good reasons (acceptable)

- The existing component's behavior fundamentally conflicts with what's needed (e.g. existing `Modal` is always full-screen, you need an inline popover — these are different things)
- The existing component is in a domain that does not apply (e.g. `TransactionBuilder` for a non-transaction prototype)
- The thing genuinely does not exist anywhere yet

## What this gate prevents

The blog post that inspired this workflow names the failure mode directly: if AI generates code freely, "it creates its own taste. It may use random colors, create one-off components, or ignore product patterns that already exist. That is not design velocity. That is just messier design debt."

The gate exists because AI agents are very good at producing plausible new components on demand. The cost shows up later, when there are three slightly-different buttons and nobody knows which one to use.

## When in doubt

Ask the question out loud:

> "I'm about to create `PrototypeButton`. Why does `<Button>` from `@stellar/design-system` not solve this?"

If the answer is fuzzy, use the existing one.

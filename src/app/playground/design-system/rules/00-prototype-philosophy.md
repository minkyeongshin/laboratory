# 00 — Prototype Philosophy

## What a prototype is

A prototype is **runnable code that explores one product idea.** It lives next to production code, uses the same stack, and looks close enough to the real product that a teammate or customer can click through it and form an opinion.

It is not a Figma file. It is not a throwaway. It is also not production.

## What a prototype is for

- Explore an interaction before committing to it
- Try multiple directions in parallel
- Move at engineering speed instead of waiting for handoff
- Capture intent in code so engineering does not have to re-interpret a static screen

## What a prototype is not

- Not a perfect production branch — backend is mocked, edge cases may be skipped
- Not a throwaway mockup — schemas, component names, and patterns must match production so the idea is reusable
- Not a place for design exploration that ignores the design system — that creates design debt, not design velocity

## Speed rules

Prototyping must feel light. If you find yourself doing any of the following, stop and reconsider:

- Spending more than 30 minutes on environment setup before writing a single line of UI
- Building a custom component when an existing one fits within 80%
- Writing real API integration when mock data would prove the idea
- Polishing pixels before the flow is approved

If a prototype is taking longer than a day, it is probably too big. Split it.

## Handoff rules

When a prototype direction is approved:

- The same component names should already be used — no rename needed
- The same data shapes should already be used — no schema translation
- Mock data is replaced with real query hooks; nothing else should change structurally
- Cleanup, tests, and edge cases are added by engineering, not redesigned

If handoff requires re-doing the structure, the prototype was built wrong.

## Why these rules exist

Every shortcut a prototype takes creates a small debt. The debt is fine if it is paid by either (a) the prototype being thrown away, or (b) engineering reusing the prototype directly. The debt becomes a problem when the prototype is half-reused and half-rewritten — that is the worst of both worlds.

Build prototypes so either outcome is cheap.

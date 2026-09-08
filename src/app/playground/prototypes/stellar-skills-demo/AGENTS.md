# Agent Rules for stellar-skills-demo Prototype

## Layout

- Content max-width: 960px, centered
- Page padding: 32px

## Hero title

The page hero title (big centered heading at top) should be:
- 40px / 600 weight

Find the matching design system token. If no exact match exists, ask me 
before applying.

## Card styling

- Card title: 16px/600
  - Code: `<Text size="md">` + CSS `font-weight: 600`
  - Color: `var(--sds-clr-gray-12)` (primary text)

- Card description: 14px/400
  - Code: `<Text size="sm">` + CSS `font-weight: 400`
  - Color: `var(--sds-clr-gray-11)` (secondary text)
  - Bottom margin: 0

- Card padding: 8px
- Container margin: 16px

## Copy pill component

Custom component for URLs and code snippets, specific to this prototype.
Build under skills-demo/components/CopyPill.tsx.

### Variant "pill" (large, used in hero)
- Background: `var(--sds-clr-gray-03)`
- Padding: 4px 8px
- Border radius: 6px
- Inline-flex, gap 8px
- Font: `var(--sds-ff-mono)`, `<Text size="md">, color `var(--sds-clr-gray-12)`
- Icon: Copy01 from design system (12px)
- On hover: text/icon shift to `var(--sds-clr-lilac-11)`
- When copied: background `var(--sds-clr-green-03)`, text `var(--sds-clr-green-11)`

### Variant "path" (small, used inside cards)
- Same as "pill" but text 16px, gap 6px
- Icon color: `var(--sds-clr-gray-09)`

Both variants:
- Click to copy text to clipboard
- Show "copied" state for 1 second
- Use `Icon.Copy01` from `@stellar/design-system`

## Content

Use placeholder text for any content that hasn't been explicitly provided. 
Don't invent product details, feature names, or copy beyond what I give you.

Source files in this folder:
- `skills-content.md` — 10 category cards
- `featured-content.md` — featured tabbed card content

## Rules for AI

1. **Ask before picking variants.** When a component has multiple style 
   variants available (e.g. Tabs primary vs secondary, Button variants), 
   list all options and ask me which to use. Never pick one based on what 
   "looks more prominent" or "seems appropriate" — that's my call.

2. **Ask before guessing tokens.** If a Figma token name doesn't match 
   the code design system, list the closest matches and ask which to use. 
   Don't apply a guess silently.

3. **No silent visual decisions.** Before applying any visual style 
   (color, spacing, typography, layout), if there's more than one 
   reasonable choice, ask first.

4. **AGENTS.md is locked until visual matches reference.** Don't update 
   this file until I confirm the result matches what I want.

5. **Match the reference, not your judgment.** When recreating a 
   reference design (e.g. stellarskills.com), match it exactly. Don't 
   "improve" or "simplify" without asking.
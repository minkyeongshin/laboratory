#!/usr/bin/env node
"use strict";

/**
 * Card text colour rule: inside a card, gray-12 is the TITLE only. Every
 * description and secondary line is gray-11.
 *
 * Heuristic: font-weight >= 500 is a title, < 500 is body. That is how this
 * codebase writes cards (titles are weight="medium", descriptions regular), and
 * it is what caught 7 wrong elements in Explore & inspect and Learn by building
 * — both had set `color` on the whole cell, which inherited onto descriptions.
 *
 * Only gray-ramp colours are judged. Accents (green, lilac) are intentional and
 * skipped — see README.
 *
 * Usage: node colors.cjs [url] [--root=<sel>] [--cards=<sel>]
 */

const {
  parseArgs,
  withPage,
  resolveRoot,
  colorName,
  isGray,
  printTable,
  finish,
  fatal,
} = require("./_lib.cjs");

const { url, flags } = parseArgs(process.argv);
const CARDS = flags.cards || ".CardGrid__cell";

withPage(url, async (page) => {
  const root = await resolveRoot(page, flags.root);
  if (!root) throw new Error("no audit root found on the page");

  const found = await page.evaluate(
    ([rootSel, cardSel]) => {
      const rootEl = document.querySelector(rootSel);
      const cards = [...rootEl.querySelectorAll(cardSel)];
      const out = [];

      cards.forEach((card, cardIndex) => {
        // Elements that directly own visible text.
        const texts = [...card.querySelectorAll("*")].filter((el) => {
          const ownText = [...el.childNodes].some(
            (n) => n.nodeType === 3 && n.textContent.trim(),
          );
          return ownText && el.getBoundingClientRect().height > 0;
        });

        texts.forEach((el) => {
          const cs = getComputedStyle(el);
          out.push({
            card: cardIndex + 1,
            text: el.innerText.trim().replace(/\s+/g, " ").slice(0, 34),
            weight: Number(cs.fontWeight),
            color: cs.color,
          });
        });
      });

      return out;
    },
    [root, CARDS],
  );

  const rows = [];
  const failures = [];
  let skipped = 0;

  for (const item of found) {
    if (!isGray(item.color)) {
      skipped++;
      continue;
    }

    const role = item.weight >= 500 ? "title" : "body";
    const expected = role === "title" ? "gray-12" : "gray-11";
    const actual = colorName(item.color);
    const ok = actual === expected;

    if (!ok) failures.push(item);

    rows.push({
      ok: ok ? "ok" : "!!",
      card: item.card,
      role,
      weight: item.weight,
      expected,
      actual,
      text: item.text,
    });
  }

  console.log(`\ncolors — ${url}\n  root=${root} cards=${CARDS}\n`);
  printTable(rows, [
    { header: "", key: "ok" },
    { header: "card", key: "card" },
    { header: "role", key: "role" },
    { header: "wt", key: "weight" },
    { header: "expected", key: "expected" },
    { header: "actual", key: "actual" },
    { header: "text", key: "text" },
  ]);

  finish({
    name: "card title/description colour",
    failures,
    checked: rows.length,
    skipped,
    notes: skipped
      ? [`${skipped} non-gray element(s) skipped as intentional accents`]
      : [],
  });
}).catch(fatal);

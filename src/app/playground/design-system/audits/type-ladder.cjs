#!/usr/bin/env node
"use strict";

/**
 * Type ladder: every rendered text size must be one the ladder allows.
 *
 *   40  page h1            (Heading size="md", 40/48)
 *   18  section title      (Text size="lg")
 *   16  hero subtitle      (Text size="md")
 *   14  body               (Text size="sm")  — the default for anything read
 *   12  meta               (Text size="xs")  — footer, commit hash, status
 *
 * Two body sizes only: 14 for anything read, 12 for meta. Any other computed
 * font-size is a violation — that is the whole check. Weight is reported for
 * context but not enforced, because the same size legitimately appears at
 * several weights (a card title and its description are both 14).
 *
 * Usage: node type-ladder.cjs [url] [--root=<sel>] [--sizes=40,18,16,14,12]
 */

const {
  parseArgs,
  withPage,
  resolveRoot,
  printTable,
  finish,
  fatal,
} = require("./_lib.cjs");

const { url, flags } = parseArgs(process.argv);
const ALLOWED = (flags.sizes || "40,18,16,14,12")
  .split(",")
  .map((n) => Number(n.trim()));

const ROLE = {
  40: "h1",
  18: "section title",
  16: "hero subtitle",
  14: "body",
  12: "meta",
};

withPage(url, async (page) => {
  const root = await resolveRoot(page, flags.root);
  if (!root) throw new Error("no audit root found on the page");

  const found = await page.evaluate((rootSel) => {
    const rootEl = document.querySelector(rootSel);
    const out = [];

    for (const el of rootEl.querySelectorAll("*")) {
      const ownText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      );
      if (!ownText) continue;
      if (!el.getBoundingClientRect().height) continue;

      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().split(" ")[0].slice(0, 26),
        size: Math.round(parseFloat(cs.fontSize)),
        weight: Number(cs.fontWeight),
        text: el.innerText.trim().replace(/\s+/g, " ").slice(0, 30),
      });
    }

    return out;
  }, root);

  // Collapse to one row per (size, weight) so the table stays readable.
  const buckets = new Map();
  for (const item of found) {
    const key = `${item.size}|${item.weight}`;
    if (!buckets.has(key)) buckets.set(key, { ...item, count: 0, example: item.text });
    buckets.get(key).count++;
  }

  const failures = [];
  const rows = [...buckets.values()]
    .sort((a, b) => b.size - a.size || a.weight - b.weight)
    .map((b) => {
      const ok = ALLOWED.includes(b.size);
      if (!ok) failures.push(b);
      return {
        ok: ok ? "ok" : "!!",
        size: `${b.size}px`,
        weight: b.weight,
        role: ok ? ROLE[b.size] || "—" : "OFF LADDER",
        count: b.count,
        example: b.example,
      };
    });

  console.log(`\ntype-ladder — ${url}\n  root=${root} allowed=${ALLOWED.join("/")}px\n`);
  printTable(rows, [
    { header: "", key: "ok" },
    { header: "size", key: "size" },
    { header: "wt", key: "weight" },
    { header: "role", key: "role" },
    { header: "n", key: "count" },
    { header: "example", key: "example" },
  ]);

  finish({
    name: "type ladder",
    failures,
    checked: found.length,
    notes: ["weight is reported, not enforced — one size serves several weights"],
  });
}).catch(fatal);

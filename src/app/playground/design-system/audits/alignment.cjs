#!/usr/bin/env node
"use strict";

/**
 * Column start alignment: the page h1's text top should sit on the same line as
 * the sidebar's current nav item, so the two columns begin together.
 *
 * Both are measured as TEXT rects (via Range), not element boxes — element
 * boxes include padding and half-leading, which differ between a 40px heading
 * and a 14px nav link and would make an aligned page look misaligned.
 *
 * Usage: node alignment.cjs [url] [--nav=Introduction] [--tolerance=1]
 */

const { parseArgs, withPage, printTable, finish, fatal } = require("./_lib.cjs");

const { url, flags } = parseArgs(process.argv);
const NAV = flags.nav || "Introduction";
const TOLERANCE = Number(flags.tolerance ?? 1);

withPage(url, async (page) => {
  const measured = await page.evaluate((navLabel) => {
    const textTop = (el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const box = range.getBoundingClientRect();
        if (box.height) return box.top;
      }
      return null;
    };

    const navTopFor = (label) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() !== label) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const box = range.getBoundingClientRect();
        if (box.height) return box.top;
      }
      return null;
    };

    const h1 = document.querySelector("h1");

    return {
      h1Top: h1 ? textTop(h1) : null,
      h1Text: h1 ? h1.innerText.trim().replace(/\s+/g, " ").slice(0, 40) : null,
      navTop: navTopFor(navLabel),
    };
  }, NAV);

  console.log(`\nalignment — ${url}\n  nav item="${NAV}" tolerance=${TOLERANCE}px\n`);

  // Missing either side is inconclusive, not a pass. A collapsed sidebar or a
  // prototype without an h1 lands here.
  if (measured.h1Top === null || measured.navTop === null) {
    const missing = [
      measured.h1Top === null ? "no <h1> found" : null,
      measured.navTop === null ? `no sidebar item "${NAV}" found` : null,
    ].filter(Boolean);

    console.log(`  SKIP  alignment — ${missing.join("; ")}`);
    console.log("  (inconclusive, not a pass — collapsed sidebar? different page?)");
    process.exit(0);
  }

  const delta = Math.round(measured.h1Top - measured.navTop);
  const ok = Math.abs(delta) <= TOLERANCE;

  printTable(
    [
      {
        ok: ok ? "ok" : "!!",
        what: `h1 text top`,
        value: `${Math.round(measured.h1Top)}px`,
        detail: measured.h1Text,
      },
      {
        ok: "",
        what: `"${NAV}" text top`,
        value: `${Math.round(measured.navTop)}px`,
        detail: "sidebar",
      },
      {
        ok: ok ? "ok" : "!!",
        what: "delta",
        value: `${delta}px`,
        detail: ok ? `within ${TOLERANCE}px` : `exceeds ${TOLERANCE}px`,
      },
    ],
    [
      { header: "", key: "ok" },
      { header: "what", key: "what" },
      { header: "value", key: "value" },
      { header: "detail", key: "detail" },
    ],
  );

  finish({
    name: "h1 / sidebar alignment",
    failures: ok ? [] : [{ delta }],
    checked: 2,
    notes: [
      "text rects, not element boxes — padding and half-leading would skew it",
      "scroll position cancels out: both rects move together",
    ],
  });
}).catch(fatal);

#!/usr/bin/env node
"use strict";

/**
 * Typographic orphans: a multi-line block whose last visual line holds a single
 * word. Measured from real client rects, not estimated from string length, so
 * it reflects the actual wrap at the current viewport.
 *
 * Single-line blocks can never be orphaned and are reported as such rather than
 * passed silently — see README.
 *
 * Usage: node orphans.cjs [url] [--root=<sel>] [--text=<sel>]
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
const TEXT =
  flags.text ||
  '[class*="__description"], [class*="__body"], .CardGrid__cell p, .CardGrid__cell div';

withPage(url, async (page) => {
  const root = await resolveRoot(page, flags.root);
  if (!root) throw new Error("no audit root found on the page");

  const found = await page.evaluate(
    ([rootSel, textSel]) => {
      // Split an element's text into visual lines by measuring each word.
      const linesOf = (el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const rows = [];
        let node;

        while ((node = walker.nextNode())) {
          if (!node.textContent.trim()) continue;
          const words = node.textContent.split(/\s+/).filter(Boolean);
          let cursor = 0;

          for (const word of words) {
            const start = node.textContent.indexOf(word, cursor);
            cursor = start + word.length;
            const range = document.createRange();
            range.setStart(node, start);
            range.setEnd(node, cursor);
            const box = range.getBoundingClientRect();
            if (!box.height) continue;
            const top = Math.round(box.top);
            const last = rows[rows.length - 1];
            if (!last || last.top !== top) rows.push({ top, words: [word] });
            else last.words.push(word);
          }
        }

        return rows;
      };

      const rootEl = document.querySelector(rootSel);
      const seen = new Set();
      const out = [];

      for (const el of rootEl.querySelectorAll(textSel)) {
        // Only elements that own text directly, so a wrapper isn't counted too.
        const ownText = [...el.childNodes].some(
          (n) => n.nodeType === 3 && n.textContent.trim(),
        );
        if (!ownText || seen.has(el)) continue;
        seen.add(el);
        if (!el.getBoundingClientRect().height) continue;

        const lines = linesOf(el);
        if (!lines.length) continue;

        out.push({
          text: el.innerText.trim().replace(/\s+/g, " ").slice(0, 46),
          lines: lines.length,
          lastWords: lines[lines.length - 1].words.length,
          lastLine: lines[lines.length - 1].words.join(" ").slice(0, 24),
        });
      }

      return out;
    },
    [root, TEXT],
  );

  const failures = [];
  let singleLine = 0;

  const rows = found.map((item) => {
    const orphan = item.lines > 1 && item.lastWords === 1;
    if (orphan) failures.push(item);
    if (item.lines === 1) singleLine++;

    return {
      ok: orphan ? "!!" : "ok",
      lines: item.lines === 1 ? "1 (n/a)" : item.lines,
      last: item.lastWords,
      lastLine: item.lastLine,
      text: item.text,
    };
  });

  console.log(`\norphans — ${url}\n  root=${root}\n`);
  printTable(rows, [
    { header: "", key: "ok" },
    { header: "lines", key: "lines" },
    { header: "last", key: "last" },
    { header: "last line", key: "lastLine" },
    { header: "text", key: "text" },
  ]);

  finish({
    name: "orphaned last lines",
    failures,
    checked: rows.length,
    notes: singleLine
      ? [
          `${singleLine} single-line block(s) marked n/a — they cannot orphan by definition`,
        ]
      : [],
  });
}).catch(fatal);

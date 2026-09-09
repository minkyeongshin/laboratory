#!/usr/bin/env node
"use strict";

/**
 * Raw hex literals in a prototype's SCSS. Colours belong to --sds-clr-* tokens;
 * a hex in a declaration is either a design-system gap or an oversight.
 *
 * Comments are stripped first, so a hex quoted in an explanatory comment does
 * not count — several are, deliberately, in homepage-v2.
 *
 * This is the one audit that reads files rather than the page. It still takes a
 * URL for a uniform interface and derives the directory from the slug, so
 * `run-all.cjs` can pass the same argument to everything.
 *
 * Usage: node raw-hex.cjs [url] [--dir=<path>]
 */

const fs = require("fs");
const path = require("path");

const { parseArgs, printTable, finish, fatal } = require("./_lib.cjs");

const { url, flags } = parseArgs(process.argv);

/** /playground/prototypes/<slug> -> src/app/playground/prototypes/<slug> */
function dirFromUrl(rawUrl) {
  const match = String(rawUrl).match(/\/playground\/prototypes\/([^/?#]+)/);
  if (!match) return null;
  return path.join("src/app/playground/prototypes", match[1]);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".scss")) out.push(full);
  }
  return out;
}

/** Strip block and line comments, preserving line numbering. */
function stripComments(source) {
  const noBlocks = source.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, " "),
  );
  return noBlocks
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("//");
      return idx === -1 ? line : line.slice(0, idx);
    })
    .join("\n");
}

try {
  const dir = flags.dir || dirFromUrl(url);

  if (!dir) {
    throw new Error(
      `could not derive a prototype directory from "${url}" — pass --dir=<path>`,
    );
  }
  if (!fs.existsSync(dir)) {
    throw new Error(`${dir} does not exist`);
  }

  const files = walk(dir);
  const failures = [];
  const rows = [];

  for (const file of files) {
    const lines = stripComments(fs.readFileSync(file, "utf8")).split("\n");

    lines.forEach((line, i) => {
      // #abc / #aabbcc / #aabbccdd, but not SCSS interpolation `#{...}`.
      for (const match of line.matchAll(/#(?![{])([0-9a-fA-F]{3,8})\b/g)) {
        const hit = {
          file: path.relative(dir, file),
          line: i + 1,
          hex: `#${match[1]}`,
          code: line.trim().slice(0, 40),
        };
        failures.push(hit);
        rows.push({ ok: "!!", ...hit });
      }
    });
  }

  console.log(`\nraw-hex — ${dir}\n  ${files.length} .scss file(s)\n`);

  if (rows.length) {
    printTable(rows, [
      { header: "", key: "ok" },
      { header: "file", key: "file" },
      { header: "line", key: "line" },
      { header: "hex", key: "hex" },
      { header: "code", key: "code" },
    ]);
  } else {
    console.log("  no hex literals outside comments");
  }

  finish({
    name: "raw hex in SCSS",
    failures,
    checked: files.length,
    notes: [
      "comments are stripped, so hexes quoted in explanations do not count",
      "does not catch rgb()/hsl() literals — gradients are a known blind spot",
    ],
  });
} catch (error) {
  fatal(error);
}

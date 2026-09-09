"use strict";

/**
 * Shared plumbing for the playground audits. Each audit is runnable on its own;
 * this only removes boilerplate.
 */

const DEFAULT_URL =
  "http://localhost:3000/playground/prototypes/homepage-v2";

/** Root candidates, first match wins. Override with --root=<selector>. */
const ROOT_CANDIDATES = [".HomeV2", ".LabLayout__content", "main", "body"];

/** Dev-only overlays that sit on top of the page and skew measurements. */
const OVERLAY_CSS = 'nextjs-portal,[class*="tsqd-"]{display:none!important}';

const GRAY = {
  "rgb(23, 23, 23)": "gray-12",
  "rgb(111, 111, 111)": "gray-11",
  "rgb(143, 143, 143)": "gray-09",
  "rgb(252, 252, 252)": "gray-01",
  "rgb(248, 248, 248)": "gray-02",
};

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = {};
  const positional = [];

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      flags[key] = value === undefined ? true : value;
    } else {
      positional.push(arg);
    }
  }

  return { url: positional[0] || flags.url || DEFAULT_URL, flags };
}

/** "rgb(23, 23, 23)" -> "gray-12", unknown colours pass through unchanged. */
function colorName(value) {
  return GRAY[value] || value;
}

/** True for colours outside the gray ramp — accents, deliberately not audited. */
function isGray(value) {
  return Boolean(GRAY[value]);
}

async function withPage(url, fn) {
  const { chromium } = require("@playwright/test");
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 90000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `${url} returned ${response ? response.status() : "no response"} — is the dev server running?`,
      );
    }

    await page.waitForTimeout(2000);
    await page.addStyleTag({ content: OVERLAY_CSS });

    return await fn(page, { pageErrors });
  } finally {
    await browser.close();
  }
}

/** Resolve the audit root inside the page. */
async function resolveRoot(page, override) {
  return page.evaluate(
    ([candidates, chosen]) => {
      const list = chosen ? [chosen] : candidates;
      for (const selector of list) {
        if (document.querySelector(selector)) return selector;
      }
      return null;
    },
    [ROOT_CANDIDATES, override || null],
  );
}

function printTable(rows, columns) {
  if (rows.length === 0) return;

  const widths = columns.map((col) =>
    Math.max(col.header.length, ...rows.map((r) => String(r[col.key] ?? "").length)),
  );

  const line = (cells) =>
    cells.map((cell, i) => String(cell ?? "").padEnd(widths[i])).join("  ");

  console.log("  " + line(columns.map((c) => c.header)));
  console.log("  " + widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) {
    console.log("  " + line(columns.map((c) => row[c.key])));
  }
}

/**
 * Print the verdict and exit. `failures` is the list of violations; anything
 * non-empty exits 1.
 */
function finish({ name, failures, checked, skipped = 0, notes = [] }) {
  console.log("");
  for (const note of notes) console.log(`  note: ${note}`);
  console.log(
    `  ${failures.length ? "FAIL" : "PASS"}  ${name} — ${checked} checked, ${failures.length} violation(s)` +
      (skipped ? `, ${skipped} skipped` : ""),
  );
  process.exit(failures.length ? 1 : 0);
}

function fatal(error) {
  console.error(`  ERROR  ${error.message}`);
  process.exit(1);
}

module.exports = {
  DEFAULT_URL,
  OVERLAY_CSS,
  parseArgs,
  colorName,
  isGray,
  withPage,
  resolveRoot,
  printTable,
  finish,
  fatal,
};

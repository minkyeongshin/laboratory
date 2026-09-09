#!/usr/bin/env node
"use strict";

/**
 * Runs every audit against one URL and aggregates the exit codes.
 * Exits 1 if any audit fails, so it works as a gate.
 *
 * Usage: pnpm playground:audit [url]
 */

const path = require("path");
const { spawnSync } = require("child_process");

const { parseArgs } = require("./_lib.cjs");

const AUDITS = [
  "colors.cjs",
  "orphans.cjs",
  "type-ladder.cjs",
  "raw-hex.cjs",
  "alignment.cjs",
];

const { url } = parseArgs(process.argv);
const extra = process.argv.slice(2).filter((a) => a.startsWith("--"));

const results = [];

for (const audit of AUDITS) {
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, audit), url, ...extra],
    { stdio: "inherit" },
  );
  results.push({ audit, code: result.status ?? 1 });
}

const failed = results.filter((r) => r.code !== 0);

console.log("\n" + "=".repeat(60));
console.log(`playground:audit — ${url}`);
console.log("=".repeat(60));
for (const r of results) {
  console.log(`  ${r.code === 0 ? "PASS" : "FAIL"}  ${r.audit}`);
}
console.log(
  `\n  ${failed.length ? `${failed.length} of ${results.length} audits failed` : `all ${results.length} audits passed`}\n`,
);

process.exit(failed.length ? 1 : 0);

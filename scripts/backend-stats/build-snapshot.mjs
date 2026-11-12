#!/usr/bin/env node
// Turns the nightly backend-test-summary.json into the public evidence
// snapshot the portfolio reads. Reuses the edge function's aggregate(), so the
// same validation and allowlisted public projection apply: repository names
// and URLs from the raw summary are never written to the output.
//
// Usage: node build-snapshot.mjs <backend-test-summary.json> <evidence.json>
// Env:   GITHUB_TOKEN (required), GITHUB_OWNER (default muhammadTasin)
import { readFile, writeFile } from "node:fs/promises";

const [summaryPath, outputPath] = process.argv.slice(2);
if (!summaryPath || !outputPath) {
  console.error("Usage: build-snapshot.mjs <summary.json> <evidence.json>");
  process.exit(2);
}

// aggregate.ts was written for Deno and only uses Deno.env.
globalThis.Deno ??= { env: { get: key => process.env[key] } };
const { aggregate } = await import("../../supabase/functions/backend-ci-stats/aggregate.ts");

const summary = JSON.parse(await readFile(summaryPath, "utf8"));
const snapshot = await aggregate(summary);
await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(JSON.stringify(snapshot, null, 2));

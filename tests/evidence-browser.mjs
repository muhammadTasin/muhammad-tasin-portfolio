// Run against npm run dev. PLAYWRIGHT_MODULE may point to a bundled installation.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
const output = process.env.EVIDENCE_QA_OUTPUT || "/tmp/evidence-qa";
await mkdir(output, { recursive: true });
const results = [];
const snapshot = (stale = false) => {
  const stamp = new Date(Date.now() - (stale ? 31 * 3600_000 : 0)).toISOString();
  return { generatedAt: stamp, backendRepositoryCount: 2,
    github: { year: new Date(stamp).getUTCFullYear(), authoredCommits: 0, longestContributionStreak: 0, activeContributionDays: 0, snapshotAt: stamp },
    tests: { passed: 0, failed: 2, skipped: 0, total: 2, reportingRepositoryCount: 1, allLatestSuitesPassing: false, snapshotAt: stamp } };
};
try {
  for (const width of [1440, 768, 390, 320]) {
    for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      let calls = 0;
      let onRequest;
      const started = new Promise(resolve => { onRequest = resolve; });
      await page.route("**/functions/v1/backend-ci-stats*", async route => {
        calls++; onRequest(); await gate;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(snapshot()) });
      });
      await page.goto(process.env.EVIDENCE_PREVIEW_URL || "http://localhost:5173/");
      await started;
      if (theme === "light") await page.getByRole("button", { name: "Switch to light theme" }).click();
      await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, theme);
      const section = page.locator(".engineering-proof-section");
      await section.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelectorAll(".evidence-value.is-loading").length === 4);
      const measure = () => page.locator(".engineering-proof-card").evaluateAll(cards => cards.map(card => {
        const r = card.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, overflow: card.scrollWidth > card.clientWidth };
      }));
      const before = await measure();
      assert.ok(before.every(card => Math.abs(card.height - (width > 560 ? 220 : 190)) < 2), "original card heights");
      assert.ok(before.every(card => !card.overflow), `loading overflow ${width} ${theme}`);
      assert.equal(await page.locator(".evidence-skeleton").first().evaluate(el => getComputedStyle(el).animationName), "none");
      await section.screenshot({ path: `${output}/${width}-${theme}-loading.png` });
      release();
      await page.waitForFunction(() => document.querySelectorAll(".evidence-value.is-ready").length === 4);
      const after = await measure();
      assert.deepEqual(after, before, `layout shift ${width} ${theme}`);
      assert.match(await section.innerText(), /0d/);
      await page.mouse.wheel(0, 500);
      await section.scrollIntoViewIfNeeded();
      assert.equal(calls, 1, "one request despite scrolling and rerenders");
      const columns = new Set(after.map(card => card.x)).size;
      assert.equal(columns, width > 1100 ? 4 : width > 560 ? 2 : 1);
      await section.screenshot({ path: `${output}/${width}-${theme}-success.png` });
      results.push({ width, theme, state: "loading → success", calls, columns, layoutShift: 0 });
      await context.close();
    }
  }
  for (const width of [1440, 768, 390]) {
    for (const mode of ["error", "stale"]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      await page.route("**/functions/v1/backend-ci-stats*", async route => {
        await gate;
        await route.fulfill({ status: mode === "error" ? 503 : 200, contentType: "application/json", body: JSON.stringify(snapshot(true)) });
      });
      await page.goto(process.env.EVIDENCE_PREVIEW_URL || "http://localhost:5173/");
      const section = page.locator(".engineering-proof-section");
      await section.scrollIntoViewIfNeeded();
      const heights = () => page.locator(".engineering-proof-card").evaluateAll(cards => cards.map(c => c.getBoundingClientRect().height));
      const before = await heights();
      release();
      await page.waitForFunction(() => document.querySelectorAll(".evidence-value.is-ready").length === 4);
      assert.deepEqual(await heights(), before, `${mode} layout shift ${width}`);
      assert.match(await section.innerText(), mode === "error" ? /Live evidence could not be refreshed/ : /Last verified snapshot/);
      assert.equal(await page.locator(".is-loading").count(), 0);
      await section.screenshot({ path: `${output}/${width}-${mode}.png` });
      results.push({ width, state: mode, layoutShift: 0 });
      await context.close();
    }
  }
  // Verify the animated mode separately from deterministic reduced-motion QA.
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.route("**/functions/v1/backend-ci-stats*", () => {});
  await page.goto(process.env.EVIDENCE_PREVIEW_URL || "http://localhost:5173/");
  await page.locator(".engineering-proof-section").scrollIntoViewIfNeeded();
  assert.equal(await page.locator(".evidence-skeleton").first().evaluate(el => getComputedStyle(el).animationName), "evidence-scan");
  assert.equal(await page.locator(".engineering-proof-status i").evaluate(el => getComputedStyle(el).animationName), "evidence-pulse");
  await context.close();
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }

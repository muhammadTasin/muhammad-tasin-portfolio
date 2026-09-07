import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
try {
  const page = await browser.newPage({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(`${process.env.EVIDENCE_PREVIEW_URL || "http://localhost:5173"}/tests/fixtures/number-roll.html`);
  await page.getByRole("button", { name: "Rerender 0", exact: true }).click();
  await page.getByRole("button", { name: "Rerender 1", exact: true }).waitFor();
  const main = page.getByTestId("main-number");
  const box = await main.boundingBox();
  assert.equal(await main.locator(".number-target").count(), 0, "unknown target has no digits");
  await page.getByRole("button", { name: "Load 638", exact: true }).click();
  assert.equal(await main.locator(".number-target").innerText(), "638", "exact accessible target is immediate");
  const samples = await main.evaluate(async el => {
    const values = [];
    const start = performance.now();
    while (performance.now() - start < 450) {
      values.push({ text: el.querySelector(".number-motion").textContent, transform: getComputedStyle(el.querySelector(".number-motion")).transform, active: !!el.querySelector(".is-rolling") });
      await new Promise(requestAnimationFrame);
    }
    return values;
  });
  assert.ok(samples.some(s => Number(s.text) > 0 && Number(s.text) < 638 && s.active));
  assert.ok(samples.some(s => s.transform !== "none" && s.active));
  assert.equal(samples.at(-1).text, "638");
  assert.equal(samples.at(-1).active, false);
  assert.deepEqual(await main.boundingBox(), box, "no layout movement");
  assert.equal(await page.getByTestId("suffix-number").locator(".number-target").innerText(), "638d");
  assert.equal(await page.getByTestId("padded-number").locator(".number-target").innerText(), "02");
  await page.getByRole("button", { name: "Rerender 1", exact: true }).click();
  assert.equal(await main.locator(".is-rolling").count(), 0, "unrelated rerender does not restart counter");

  // Refresh starts at the previous displayed value; rapid retarget cancels old work.
  await page.getByRole("button", { name: "Load 640", exact: true }).click();
  assert.ok(Number(await main.locator(".number-motion").textContent()) >= 638);
  await page.getByRole("button", { name: "Load 24", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('[data-testid="main-number"] .is-rolling'));
  assert.equal(await main.locator(".number-motion").textContent(), "24");

  await page.getByRole("button", { name: "Load 638", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => !document.querySelector('[data-testid="main-number"] .is-rolling'));
  assert.equal(await main.locator(".number-target").innerText(), "638");
  await page.getByRole("button", { name: "Load 1", exact: true }).click();
  assert.equal(await main.locator(".is-rolling").count(), 0);
  assert.equal(await main.locator(".number-target").innerText(), "1");
  await page.getByRole("button", { name: "Load 0", exact: true }).click();
  assert.equal(await main.locator(".number-target").innerText(), "0");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  assert.equal(await main.locator(".number-loading-tracks i").first().evaluate(el => getComputedStyle(el).animationName), "none");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Load 638", exact: true }).click();
  await page.getByRole("button", { name: "Toggle mount", exact: true }).click();
  await page.waitForTimeout(450);
  assert.equal(await main.locator(".rolling-number").count(), 0);
  assert.deepEqual(errors, []);
  console.log("PASS: bounded count-up, downward entry, exact accessible target, cached refresh, retargeting, formatting, reduced-motion changes, zero, no rerender replay, unmount and fixed geometry");
} finally { await browser.close(); }

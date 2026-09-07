import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EngineeringEvidence } from "../components/engineering-evidence.tsx";
import { createEvidenceStore, nextDailyRefresh } from "../lib/evidence-store.ts";
import { isEvidenceSnapshot, snapshotAgeState, MAX_AGE_MS } from "../supabase/functions/_shared/evidence.ts";
import { createEvidenceHandler } from "../supabase/functions/backend-ci-stats/handler.ts";

const now = Date.parse("2026-09-07T12:00:00Z");
export const fixture = (age = 0) => {
  const stamp = new Date(now - age).toISOString();
  return { generatedAt: stamp, backendRepositoryCount: 2,
    github: { year: 2026, authoredCommits: 0, longestContributionStreak: 0, activeContributionDays: 0, snapshotAt: stamp },
    tests: { passed: 0, failed: 2, skipped: 0, total: 2, reportingRepositoryCount: 1, allLatestSuitesPassing: false, snapshotAt: stamp } };
};
const render = state => renderToStaticMarkup(React.createElement(EngineeringEvidence, { state }));
const flush = () => new Promise(resolve => setTimeout(resolve, 5));

test("loading renders four accessible skeletons; success and error leave loading", () => {
  const loading = render({ status: "loading", data: null });
  assert.equal((loading.match(/evidence-value is-loading/g) || []).length, 4);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /Retrieving verified engineering evidence/);
  assert.doesNotMatch(loading, /—|Awaiting the first/);
  const success = render({ status: "success", data: fixture() });
  assert.equal((success.match(/evidence-value is-ready/g) || []).length, 4);
  assert.match(success, /aria-busy="false"/);
  assert.match(success, />0d</);
  assert.match(success, />0</);
  assert.match(success, /Review/);
  assert.doesNotMatch(success, /is-passing/);
  const error = render({ status: "error", data: null });
  assert.match(error, /Unavailable/);
  assert.doesNotMatch(error, /is-loading|Collecting/);
});

test("zero reporting coverage is 00; no evidence is never passing", () => {
  const data = fixture();
  Object.assign(data.tests, { failed: 0, total: 0, reportingRepositoryCount: 0 });
  assert.ok(isEvidenceSnapshot(data));
  const html = render({ status: "success", data });
  assert.match(html, />00</);
  assert.match(html, /No reports/);
  assert.match(html, /No verified test reports available/);
  assert.doesNotMatch(html, /is-passing/);
});

test("stale data is dated, bounded, and invalid totals are rejected", () => {
  const data = fixture(31 * 3600_000);
  assert.equal(snapshotAgeState(data, now), "stale-success");
  assert.match(render({ status: "stale-success", data }), /Last verified snapshot.*Refresh delayed/);
  assert.equal(snapshotAgeState(fixture(MAX_AGE_MS + 1), now), "expired");
  assert.equal(isEvidenceSnapshot({ ...data, tests: { ...data.tests, total: 100 } }), false);
});

test("one shared request across subscribers, Strict Mode reattach and rerenders", async () => {
  let calls = 0, resolve;
  const store = createEvidenceStore(async (url, options) => {
    calls++;
    assert.ok(!url.includes("?"));
    assert.equal(options.cache, undefined);
    await new Promise(r => { resolve = r; });
    return Response.json(fixture());
  }, () => now);
  const unsub = store.subscribe(() => {});
  unsub();
  const unsub2 = store.subscribe(() => {});
  const unsub3 = store.subscribe(() => {});
  assert.equal(store.getSnapshot().status, "loading");
  resolve(); await store.refresh();
  assert.equal(calls, 1);
  assert.equal(store.getSnapshot().status, "success");
  unsub2(); unsub3(); await flush();
  const unsub4 = store.subscribe(() => {});
  assert.equal(calls, 1);
  unsub4(); await flush();
});

test("network failure exits loading, retains good data on refresh, expires old data", async () => {
  let fail = true, clock = now;
  const store = createEvidenceStore(async () => {
    if (fail) throw new Error("offline");
    return Response.json(fixture());
  }, () => clock);
  const unsub = store.subscribe(() => {});
  await store.refresh();
  assert.equal(store.getSnapshot().status, "error");
  fail = false; await store.refresh();
  fail = true; await store.refresh();
  assert.equal(store.getSnapshot().status, "stale-success");
  assert.equal(store.getSnapshot().data.tests.passed, 0);
  clock += MAX_AGE_MS + 1; await store.refresh();
  assert.equal(store.getSnapshot().status, "error");
  unsub(); await flush();
});

test("real unmount aborts pending request without updating subscribers", async () => {
  let aborted = false, updates = 0;
  const store = createEvidenceStore((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => { aborted = true; reject(signal.reason); });
  }), () => now);
  const unsub = store.subscribe(() => updates++);
  unsub(); await flush();
  assert.ok(aborted);
  assert.equal(updates, 0);
});

test("daily refresh is at 00:10 Bangladesh time, including year boundary", () => {
  assert.equal(new Date(nextDailyRefresh(now)).toISOString(), "2026-09-07T18:10:00.000Z");
  assert.equal(new Date(nextDailyRefresh(Date.parse("2026-12-31T18:11:00Z"))).toISOString(), "2027-01-01T18:10:00.000Z");
});

test("public GET reads persisted snapshot and performs zero aggregation", async () => {
  let reads = 0, aggregates = 0, writes = 0;
  const handler = createEvidenceHandler({ readSnapshot: async () => { reads++; return fixture(); },
    aggregate: async () => { aggregates++; return fixture(); }, saveSnapshot: async () => { writes++; }, now: () => now });
  for (let i = 0; i < 3; i++) {
    const response = await handler(new Request("https://example.com"));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("Cache-Control"), /s-maxage=300, stale-while-revalidate=600/);
    assert.equal((await response.json()).tests.passed, 0);
  }
  assert.equal(reads, 3); assert.equal(aggregates, 0); assert.equal(writes, 0);
});

test("missing, invalid, expired snapshots and storage failures return non-cacheable errors", async () => {
  for (const data of [null, {}, fixture(MAX_AGE_MS + 1), new Error("storage")]) {
    const handler = createEvidenceHandler({ readSnapshot: async () => { if (data instanceof Error) throw data; return data; },
      aggregate: async () => { throw new Error("must not aggregate"); }, saveSnapshot: async () => {}, now: () => now });
    const response = await handler(new Request("https://example.com"));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
});

test("refresh requires secret; failing refresh never overwrites saved evidence", async () => {
  let writes = 0, aggregates = 0;
  const handler = createEvidenceHandler({ readSnapshot: async () => fixture(), refreshSecret: "test-only-secret",
    aggregate: async () => { aggregates++; throw new Error("upstream failed"); }, saveSnapshot: async () => { writes++; }, now: () => now });
  assert.equal((await handler(new Request("https://example.com", { method: "POST" }))).status, 401);
  assert.equal(aggregates, 0);
  const response = await handler(new Request("https://example.com", { method: "POST",
    headers: { "x-evidence-refresh-secret": "test-only-secret" }, body: JSON.stringify(fixture()) }));
  assert.equal(response.status, 503); assert.equal(writes, 0); assert.equal(aggregates, 1);
});

test("nightly aggregation reuses verified GitHub fields and strips private repository details", async () => {
  const previousDeno = globalThis.Deno;
  globalThis.Deno = { env: { get: key => key === "GITHUB_TOKEN" ? "test-token" : "muhammadTasin" } };
  try {
    const { aggregate } = await import("../supabase/functions/backend-ci-stats/aggregate.ts");
    const data = fixture();
    const summary = { generatedAt: data.generatedAt, expectedRepositoryCount: 2, scannedRepositoryCount: 2,
      reportingRepositoryCount: 1, passed: 0, failed: 2, skipped: 0, total: 2, allReportingSuitesPassing: false,
      github: data.github,
      repositories: [
        { repository: "private-repo", status: "failing", passed: 0, failed: 2, skipped: 0, total: 2 },
        { repository: "unconfigured-repo", status: "not-configured", passed: 0, failed: 0, skipped: 0, total: 0 },
      ] };
    const oldFetch = globalThis.fetch;
    globalThis.fetch = () => { throw new Error("Complete snapshot must not invoke GitHub"); };
    try {
      const result = await aggregate(summary);
      assert.deepEqual(result, data);
      assert.doesNotMatch(JSON.stringify(result), /private-repo|unconfigured-repo|repositories/);
      await assert.rejects(aggregate({ ...summary, scannedRepositoryCount: 1 }), /Incomplete/);
      await assert.rejects(aggregate({ ...summary, passed: 100 }), /Invalid test totals/);
      await assert.rejects(aggregate({ ...summary, allReportingSuitesPassing: true }), /Invalid test reporting/);
    } finally { globalThis.fetch = oldFetch; }
  } finally { globalThis.Deno = previousDeno; }
});

test("background GitHub collection preserves authored commits, streak and active-day semantics", async () => {
  const { aggregate } = await import("../supabase/functions/backend-ci-stats/aggregate.ts");
  const oldFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push(url);
    if (url.includes("/user/repos")) return Response.json([
      { name: "owned", fork: false, archived: false },
      { name: "fork", fork: true, archived: false },
      { name: "archived", fork: false, archived: true },
    ]);
    if (url.includes("/commits")) {
      assert.ok(url.includes("author=muhammadTasin"));
      assert.ok(url.includes("since=2026-01-01"));
      assert.ok(url.includes("until="));
      return Response.json([{}], { headers: { link: '<https://api.github.com/items?per_page=1&page=4>; rel="last"' } });
    }
    assert.equal(url, "https://api.github.com/graphql");
    const body = JSON.parse(options.body);
    assert.equal(body.variables.to, fixture().generatedAt);
    return Response.json({ data: { user: { contributionsCollection: { contributionCalendar: { weeks: [{ contributionDays: [
      { date: "2026-01-01", contributionCount: 1 },
      { date: "2026-01-02", contributionCount: 2 },
      { date: "2026-01-03", contributionCount: 0 },
      { date: "2026-01-04", contributionCount: 1 },
    ] }] } } } } });
  };
  const summary = { generatedAt: fixture().generatedAt, expectedRepositoryCount: 0, scannedRepositoryCount: 0,
    reportingRepositoryCount: 0, passed: 0, failed: 0, skipped: 0, total: 0, allReportingSuitesPassing: false, repositories: [] };
  try {
    const result = await aggregate(summary);
    assert.equal(calls.length, 3);
    assert.equal(result.github.authoredCommits, 4);
    assert.equal(result.github.longestContributionStreak, 2);
    assert.equal(result.github.activeContributionDays, 3);
    globalThis.fetch = async () => new Response(null, { status: 500 });
    await assert.rejects(aggregate(summary), /GitHub API request failed/);
  } finally { globalThis.fetch = oldFetch; }
});

test("request timeout exits loading instead of leaving an infinite skeleton", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const store = createEvidenceStore((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason));
  }), () => now);
  const unsub = store.subscribe(() => {});
  const pending = store.refresh();
  t.mock.timers.tick(12_000);
  await pending;
  assert.equal(store.getSnapshot().status, "error");
  unsub(); t.mock.timers.tick(1);
});

test("daily read retries every five minutes until the delayed nightly snapshot arrives", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let clock = now, calls = 0;
  const store = createEvidenceStore(async () => { calls++; return Response.json(fixture()); }, () => clock);
  const unsub = store.subscribe(() => {});
  await store.refresh();
  assert.equal(calls, 1);
  const delay = nextDailyRefresh(clock) - clock;
  clock += delay;
  t.mock.timers.tick(delay);
  await store.refresh();
  assert.equal(calls, 2);
  clock += 5 * 60_000;
  t.mock.timers.tick(5 * 60_000);
  await store.refresh();
  assert.equal(calls, 3);
  unsub(); t.mock.timers.tick(1);
});

test("a lagging cache response cannot replace a newer verified snapshot", async () => {
  let old = false;
  const store = createEvidenceStore(async () => Response.json(fixture(old ? 3600_000 : 0)), () => now);
  const unsub = store.subscribe(() => {});
  await store.refresh(); old = true; await store.refresh();
  assert.equal(store.getSnapshot().data.generatedAt, fixture().generatedAt);
  assert.equal(store.getSnapshot().status, "stale-success");
  unsub(); await flush();
});

import assert from "node:assert/strict";
import test from "node:test";
import { readSnapshot, saveSnapshot } from "../supabase/functions/backend-ci-stats/storage.ts";

test("storage reads one saved row and uses the timestamp-guarded publisher RPC", async () => {
  const originalDeno = globalThis.Deno;
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.Deno = { env: { get: key => key === "SUPABASE_URL" ? "https://test.invalid" : "server-only-test-key" } };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return Response.json([{ payload: { generatedAt: "test-stamp" } }]);
  };
  try {
    assert.deepEqual(await readSnapshot(), { generatedAt: "test-stamp" });
    await saveSnapshot({ generatedAt: "test-stamp" });
    assert.equal(calls[0].url, "https://test.invalid/rest/v1/engineering_evidence_snapshot?id=eq.1&select=payload");
    assert.equal(calls[1].url, "https://test.invalid/rest/v1/rpc/publish_engineering_evidence");
    assert.equal(calls[1].options.method, "POST");
    assert.ok(calls.every(c => c.options.headers.Authorization === "Bearer server-only-test-key"));
    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(readSnapshot(), /Snapshot storage failed/);
    await assert.rejects(saveSnapshot({}), /Snapshot storage failed/);
  } finally { globalThis.Deno = originalDeno; globalThis.fetch = originalFetch; }
});

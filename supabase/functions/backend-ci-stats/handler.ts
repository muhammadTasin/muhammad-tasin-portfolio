import { isEvidenceSnapshot, snapshotAgeState, type EvidenceSnapshot } from "../_shared/evidence.ts";
import type { BackendTestSummary } from "./github_snapshot.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const json = (body: unknown, status = 200, cache = "no-store") => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": cache },
});

export function createEvidenceHandler(deps: {
  readSnapshot: () => Promise<unknown>;
  saveSnapshot: (snapshot: EvidenceSnapshot) => Promise<void>;
  aggregate: (summary: BackendTestSummary) => Promise<EvidenceSnapshot>;
  refreshSecret?: string;
  now?: () => number;
}) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (request.method === "POST") {
      if (!deps.refreshSecret || request.headers.get("x-evidence-refresh-secret") !== deps.refreshSecret) {
        return json({ error: "Unauthorized" }, 401);
      }
      try {
        // Bound the body before parsing or doing privileged remote work.
        const reader = request.body?.getReader();
        if (!reader) return json({ error: "Missing summary" }, 400);
        const chunks: Uint8Array[] = [];
        let bytes = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          bytes += value.length;
          if (bytes > 1_000_000) { await reader.cancel(); return json({ error: "Summary too large" }, 413); }
          chunks.push(value);
        }
        const body = new Uint8Array(bytes);
        let offset = 0;
        for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
        const summary = JSON.parse(new TextDecoder().decode(body));
        const age = (deps.now?.() ?? Date.now()) - Date.parse(summary.generatedAt);
        if (!Number.isFinite(age) || age < -300_000 || age > 30 * 60 * 60 * 1000) {
          return json({ error: "Summary is not recent" }, 400);
        }
        const snapshot = await deps.aggregate(summary);
        if (!isEvidenceSnapshot(snapshot)) throw new Error("Invalid snapshot");
        await deps.saveSnapshot(snapshot);
        return json({ generatedAt: snapshot.generatedAt });
      } catch {
        return json({ error: "Snapshot refresh failed; previous snapshot retained." }, 503);
      }
    }
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    try {
      const snapshot = await deps.readSnapshot();
      if (!isEvidenceSnapshot(snapshot)) return json({ error: "No verified snapshot available" }, 503);
      const state = snapshotAgeState(snapshot, deps.now?.() ?? Date.now());
      if (state === "expired") return json({ error: "Verified snapshot has expired" }, 503);
      return json({ ...snapshot, state }, 200, "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    } catch {
      return json({ error: "Unable to read verified snapshot" }, 503);
    }
  };
}

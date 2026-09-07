import type { EvidenceSnapshot } from "../_shared/evidence.ts";

async function storage(path: string, options: RequestInit = {}) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Snapshot storage is not configured");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Snapshot storage failed: ${response.status}`);
  return response;
}

export async function readSnapshot(): Promise<unknown> {
  const response = await storage("engineering_evidence_snapshot?id=eq.1&select=payload");
  const rows = await response.json();
  return rows[0]?.payload ?? null;
}

export async function saveSnapshot(snapshot: EvidenceSnapshot): Promise<void> {
  // Database-side timestamp guard prevents a delayed older job from overwriting
  // a newer verified snapshot. Failed refreshes never delete the existing row.
  await storage("rpc/publish_engineering_evidence", {
    method: "POST", body: JSON.stringify({ snapshot }),
  });
}

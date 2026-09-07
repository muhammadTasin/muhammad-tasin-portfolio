import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@^1";
import { aggregate } from "./aggregate.ts";
import { createEvidenceHandler } from "./handler.ts";
import { readSnapshot, saveSnapshot } from "./storage.ts";

export default {
  fetch: withSupabase({ auth: "none" }, createEvidenceHandler({
    readSnapshot, saveSnapshot, aggregate,
    refreshSecret: Deno.env.get("EVIDENCE_REFRESH_SECRET"),
  })),
};

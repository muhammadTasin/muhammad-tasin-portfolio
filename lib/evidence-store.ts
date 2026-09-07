import { isEvidenceSnapshot, snapshotAgeState, type EvidenceSnapshot } from "../supabase/functions/_shared/evidence";

export const EVIDENCE_URL = "https://nsiyjrhplawzooopgtox.supabase.co/functions/v1/backend-ci-stats";
export type EvidenceState =
  | { status: "loading" | "error"; data: null }
  | { status: "success" | "stale-success"; data: EvidenceSnapshot };
export const INITIAL_EVIDENCE: EvidenceState = { status: "loading", data: null };
const RETRY_MS = 5 * 60 * 1000;

// Midnight workflow, with an initial read at 00:10 Bangladesh time.
export function nextDailyRefresh(now: number) {
  const local = new Date(now + 6 * 60 * 60 * 1000);
  const next = new Date(local);
  next.setUTCHours(0, 10, 0, 0);
  if (next.getTime() <= local.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - 6 * 60 * 60 * 1000;
}

export function createEvidenceStore(fetcher: typeof fetch = fetch, now = Date.now) {
  let state = INITIAL_EVIDENCE;
  let lastAttempt = 0;
  let flight: Promise<void> | undefined;
  let controller: AbortController | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let teardown: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  const emit = (value: EvidenceState) => { state = value; listeners.forEach(fn => fn()); };
  const retained = (): EvidenceSnapshot | null =>
    state.data && snapshotAgeState(state.data, now()) !== "expired" ? state.data : null;

  function schedule() {
    clearTimeout(timer);
    if (!listeners.size) return;
    const daily = state.data ? nextDailyRefresh(Date.parse(state.data.generatedAt)) : 0;
    // Retry while the midnight scan is still running or a refresh has failed.
    const delay = state.status !== "success" || daily <= now()
      ? RETRY_MS : Math.min(daily, nextDailyRefresh(now())) - now();
    timer = setTimeout(() => { void refresh(); }, delay);
  }

  function refresh(): Promise<void> {
    if (flight) return flight;
    controller = new AbortController();
    const current = controller;
    const timeout = setTimeout(() => current.abort(new Error("Evidence request timed out")), 12_000);
    lastAttempt = now();
    flight = (async () => {
      try {
        const response = await fetcher(EVIDENCE_URL, { signal: current.signal });
        if (!response.ok) throw new Error("Evidence unavailable");
        const data: unknown = await response.json();
        if (!isEvidenceSnapshot(data)) throw new Error("Invalid evidence");
        const status = snapshotAgeState(data, now());
        if (status === "expired") throw new Error("Expired evidence");
        const previous = retained();
        if (!current.signal.aborted) {
          // A lagging cache must not roll back a newer verified snapshot.
          emit(previous && Date.parse(previous.generatedAt) > Date.parse(data.generatedAt)
            ? { status: "stale-success", data: previous } : { status, data });
        }
      } catch {
        // Unmount cancellation has no subscribers to update. A timeout or
        // network failure while mounted always exits the loading state.
        if (listeners.size) {
          const data = retained();
          emit(data ? { status: "stale-success", data } : { status: "error", data: null });
        }
      } finally {
        clearTimeout(timeout);
        flight = undefined;
        controller = undefined;
        schedule();
      }
    })();
    return flight;
  }

  return {
    getSnapshot: () => state,
    refresh,
    subscribe(listener: () => void) {
      clearTimeout(teardown);
      listeners.add(listener);
      if (state.data && !retained()) emit({ status: "loading", data: null });
      if (!flight && (state.status === "loading" || now() - lastAttempt >= RETRY_MS)) void refresh();
      else schedule();
      return () => {
        listeners.delete(listener);
        // React Strict Mode immediately reattaches. Share the pending request
        // across that cycle, but abort it on a real unmount.
        teardown = setTimeout(() => {
          if (!listeners.size) { clearTimeout(timer); controller?.abort(); }
        }, 0);
      };
    },
  };
}

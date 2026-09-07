# Engineering Evidence: implementation and rollout

Implemented and verified locally on 7 September 2026. The Vercel production website and Supabase endpoint have **not** been updated by this change. A frontend deployment alone does not activate the faster data pipeline.

## Diagnosis and architecture

Previously each browser requested a timestamp-busted, `no-store` URL. The public Edge Function listed repositories, downloaded a test artifact, queried contributions, counted authored commits across repositories, and queried recent workflow runs. Several operations were serial; the endpoint returned only `public, max-age=60`. It also exposed repository details that the page never consumed.

The nightly workflow already generates the verified test summary. Its TypeScript type includes optional GitHub fields, but the actual workflow does not generate those fields. Reusing that type without collecting the data would have produced missing or invented activity metrics.

The new flow is:

```text
Midnight Bangladesh GitHub workflow → existing verified test summary
  → authenticated POST to backend-ci-stats
  → GitHub activity collection once, unless already supplied in the summary
  → validated, aggregate-only snapshot in Supabase Postgres
  → public GET reads one saved row → portfolio
```

GET never calls GitHub, including when the database is empty or unavailable. No isolate-local cache is required for correctness or persistence. Repository discovery and commit counting are paginated/bounded; unrelated workflow-run requests and artifact downloads are removed. The existing contribution-calendar and longest-streak algorithm is unchanged. Authored commits retain the owner/non-fork/non-archived/current-UTC-year definition, now bounded to the snapshot timestamp. Test coverage counts reporting repositories, not percentage code coverage. Verified zero results remain zero; zero reporting repositories shows `00` coverage and unavailable test totals, never a passing status.

The existing page remains a client component because navigation, theme, modals, scroll effects, and the hero depend on client state. Only the evidence section and its data lifecycle were extracted. One shared subscription supplies both hero highlights and evidence cards, avoiding a second request or a framework-specific server cache.

## UI and lifecycle

- Four original cards, responsive 4/2/1-column layout, original typography, themes, borders, accents and hover styling.
- Distinct three-track loading reels without numeric measurements, a softly pulsing collecting dot, and clear retrieval text.
- Once a verified target is known, an eased requestAnimationFrame count-up enters vertically from above and settles in 140–400 ms. One-unit changes take 140 ms; unchanged values do not animate. New targets continue from the current presentation value, canceling the previous frame loop. No animation dependency or network delay was added.
- The exact target remains available to assistive technology immediately; intermediate values are an aria-hidden presentation layer. Reduced-motion shows the exact target immediately, including when the preference changes mid-animation. Suffixes, grouping, padded repository counts and true zeros are preserved. The same counter is used for authored commits and repository counts in the hero.
- Fixed value and two-line caption slots retain the original 220 px desktop/tablet and 190 px mobile card minimums.
- Reduced-motion disables loading reels, dot and value animation/transition. An accessible live status announces completion/error and timestamps.
- Explicit `loading`, `success`, `stale-success`, `error` states. A 12-second request deadline prevents an infinite skeleton.
- One in-flight request is shared through Strict Mode reattachment and rerenders. Actual unmount aborts pending work and clears timers. Scrolling does not fetch.
- First daily read remains 00:10 Bangladesh time. If the midnight scan has not finished, retry every five minutes until a newer snapshot arrives. Failures also retry every five minutes while subscribed. Fresh remounts reuse memory for five minutes; one shared timer controls refreshes.

## Cache and stale policy

GET sends `public, max-age=60, s-maxage=300, stale-while-revalidate=600`. The browser now uses normal HTTP caching. CDN directives are an opportunity for supporting intermediaries; Supabase's deployed CDN cache-hit behavior is **not assumed**. Even a cache miss reads one database row, not GitHub.

The timestamp is the source scan time, not the GET time. Snapshots older than 30 hours are explicitly stale. Up to seven days, display the last verified snapshot with its Bangladesh timestamp. Older, malformed or missing snapshots return a non-cacheable 503; the frontend also validates age, including any intermediary's stale response. Network/storage/GitHub failures never create zero metrics. Client refresh failure retains a valid in-memory snapshot. Older cached responses cannot roll back newer client data.

The database publisher is timestamp-guarded, so a delayed older job cannot overwrite a newer row. Incomplete matrix scans and inconsistent test totals reject publication and retain the previous row. Genuine failing tests and explicit unconfigured/error repository results remain valid evidence; they are not relabeled as passing.

The table has RLS enabled, no anon/authenticated privileges, and a service-role-only publishing RPC. Only allowlisted aggregate fields are saved or returned. Raw private repository details and credentials are never sent to visitors.

## Measurements and validation

Production baseline, taken before changing any deployment:

| Measurement | Result |
| --- | --- |
| Direct endpoint sample 1 | HTTP 200, 5.379721 s |
| Direct endpoint sample 2 | HTTP 200, 4.890924 s |
| Actual production browser | 1 stats request, timestamp cache buster present, 4.917 s |
| Cache response | `public, max-age=60`; `cf-cache-status: DYNAMIC` |
| New local browser | 1 initial stats request; no timestamp/no-store; fixture-delayed success |
| New GET handler regression | 3 reads → 3 persisted-row reads, 0 aggregation calls, 0 writes |

**There is no measured deployed “after” latency yet.** Local handler and browser tests use controlled fixtures/storage mocks; their execution times are not comparable to Supabase network latency. The proven improvement is removal of all visitor-triggered GitHub aggregation. Validate deployed latency and cache behavior after the rollout below.

Final local verification results:

- `npm run lint`: exit 0; 0 errors, 11 pre-existing warnings.
- `npx tsc --noEmit`: exit 0.
- `npm run build`: exit 0; ESM Worker and hosting artifact validation passed.
- `npm test`: exit 0; 21/21 tests passed, including the original rendered-HTML check.
- Deno Edge Function type check: exit 0 (existing dependency install-script warnings only).
- Browser QA: 14 responsive state/theme scenarios passed, plus normal/reduced-motion checks and the dedicated rolling-counter browser suite (refresh, retargeting, formatting, exact accessible values, unmount and rerender behavior). No card geometry changes or overflow in the tested transitions.
- `git diff --check`: passed.

Verification commands:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npx --yes --package=deno -- deno check --node-modules-dir=none --no-lock supabase/functions/backend-ci-stats/index.ts
```

`npm test` retains the production build, artifact checks and original rendered-HTML test, adding focused state, lifecycle, scheduling, storage, authentication, privacy, snapshot validation and statistics tests through the already-installed TypeScript compiler. No application dependencies were added. Deno checking requires network access to resolve the existing Edge dependencies.

Browser regression runner (with an available Playwright installation and Chrome):

```bash
npm run dev -- --host 0.0.0.0
# In another terminal; omit these environment overrides if Playwright is installed normally.
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
CHROME_EXECUTABLE=/usr/bin/google-chrome \
node tests/evidence-browser.mjs

# With the same Playwright/Chrome environment, exercise rolling-number behavior:
node tests/number-roll-browser.mjs
```

The browser runner uses clearly controlled test fixtures, never writes them to production, and saves screenshots/results under `/tmp/evidence-qa` by default. It checks dark/light loading-to-success at 1440, 768, 390 and 320 px, one request, zero card geometry changes, no card overflow, and original card heights. Error/stale transitions are checked at 1440, 768 and 390 px. Reduced and regular motion are checked separately.

## Required production rollout

1. Apply `supabase/migrations/20260907000000_engineering_evidence_snapshot.sql` to project `nsiyjrhplawzooopgtox` using the SQL editor or your normal linked Supabase migration workflow. This adds one table and RPC, without changing existing tables. Review pending migrations before running `supabase db push`.
2. Generate a strong random `EVIDENCE_REFRESH_SECRET` and save the **same value** in Supabase Edge Function secrets and this GitHub repository's Actions secrets. Keep it out of source files and shell history. Preserve the existing `GITHUB_TOKEN`, `GITHUB_OWNER` and `BACKEND_REPOS_TOKEN` configuration. The function uses Supabase's server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; never put these in `NEXT_PUBLIC_*` variables. See [Supabase's secret-management documentation](https://supabase.com/docs/guides/functions/secrets).
3. Prepare a recent, complete `backend-test-summary` artifact (less than 30 hours old) from the existing trusted workflow for the initial seed. Alternatively, run the updated workflow manually after deploying the function. Until the first successful publication, GET intentionally returns 503; plan this bootstrap before updating the frontend.
4. Deploy the Edge Function:

   ```bash
   npx supabase functions deploy backend-ci-stats --project-ref nsiyjrhplawzooopgtox
   ```

   Preserve the existing `verify_jwt = false` configuration. Public GET is intentional; POST independently requires `x-evidence-refresh-secret`.
5. Publish the prepared summary with the authenticated POST used at the end of `.github/workflows/scalable-backend-test-scan.yml`, or push the updated workflow and run **Scalable Backend Test Scan** using **Run workflow**. Verify the publish step succeeds. Normal scheduled refresh remains midnight `Asia/Dhaka`; actual availability follows completion of the scan.
6. Verify the public endpoint returns HTTP 200, a recent `generatedAt`, and the expected test totals/contribution metrics. Confirm the public payload contains no repository names/URLs. An unauthenticated POST must return 401; normal GET must not cause GitHub requests.
7. Deploy this repository's frontend through the existing Vercel process, then check the actual production website's loading/success/error behavior and Network panel. One stats request should appear without a query timestamp. Compare `curl -w '%{time_total}'` timings over several cold/warm requests and inspect `Cache-Control`, `Age` and `cf-cache-status` where present. Do not interpret the configured CDN directives as proof of a cache hit.

No Supabase schema changes, secret writes, function deployment, GitHub workflow push/run or Vercel deployment have been performed in this work. The database migration has not been exercised against the hosted project. Production is not claimed fixed.

## Changed files

- `app/page.tsx`, `components/engineering-evidence.tsx`, `components/rolling-number.tsx`, `lib/number-roll.ts`, `app/globals.css`: shared data integration and evidence UI.
- `lib/evidence-store.ts`, `lib/use-engineering-evidence.ts`: explicit states, validation, coalescing, cancellation and scheduling.
- `supabase/functions/_shared/evidence.ts`: common public schema and freshness policy.
- `supabase/functions/backend-ci-stats/index.ts`, `handler.ts`, `storage.ts`, `aggregate.ts`: public snapshot reader and privileged publisher.
- `supabase/functions/backend-ci-stats/github_contributions.ts`: timeout around the unchanged contribution calculation.
- `supabase/migrations/20260907000000_engineering_evidence_snapshot.sql`: durable protected snapshot and guarded publisher.
- `.github/workflows/scalable-backend-test-scan.yml`: publish after the existing aggregate artifact upload.
- `tests/evidence.test.mjs`, `tests/evidence-storage.test.mjs`, `tests/evidence-browser.mjs`, `tests/register-typescript.mjs`, `tests/typescript-loader.mjs`, `package.json`: new coverage without removing existing verification.
- `tests/number-roll.test.mjs`, `tests/number-roll-browser.mjs`, `tests/fixtures/number-roll.html`, `tests/fixtures/number-roll.tsx`: rolling animation math, formatting and development-only interactive browser fixture.
- `ENGINEERING_EVIDENCE.md`: diagnosis, measurements and rollout instructions.

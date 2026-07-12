import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@^1";
import {
  loadLatestBackendTestSummary,
} from "./github_snapshot.ts";
import {
  loadContributionSnapshot,
} from "./github_contributions.ts";

const GITHUB_OWNER =
  Deno.env.get("GITHUB_OWNER") ?? "muhammadTasin";

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type GitHubRepository = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  default_branch: string;
};

type GitHubWorkflowRun = {
  status: string | null;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  head_branch: string | null;
  event: string;
};

function jsonResponse(data: unknown, status = 200): Response {
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json; charset=utf-8",
  };

  if (status === 200) {
    headers["Cache-Control"] = "public, max-age=60";
  }

  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers,
  });
}

async function countGitHubItems(path: string): Promise<number> {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": "muhammad-tasin-portfolio",
  });

  if (GITHUB_TOKEN) {
    headers.set("Authorization", `Bearer ${GITHUB_TOKEN}`);
  }

  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(
    `https://api.github.com${path}${separator}per_page=1`,
    { headers },
  );

  if (response.status === 409) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(
      `GitHub count request failed: ${response.status}`,
    );
  }

  const items = (await response.json()) as unknown[];

  if (items.length === 0) {
    return 0;
  }

  const link = response.headers.get("link");
  const lastPage = link?.match(
    /[?&]page=(\d+)>; rel="last"/,
  );

  return lastPage ? Number(lastPage[1]) : items.length;
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": "muhammad-tasin-portfolio",
  });

  if (GITHUB_TOKEN) {
    headers.set("Authorization", `Bearer ${GITHUB_TOKEN}`);
  }

  const response = await fetch(`https://api.github.com${path}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function isBackendRepository(repository: GitHubRepository): boolean {
  const backendTopics = new Set([
    "backend",
    "api",
    "rest-api",
    "fastapi",
    "django",
    "flask",
    "express",
    "nodejs",
    "spring-boot",
    "server",
    "supabase",
  ]);

  const hasBackendTopic = (repository.topics ?? []).some((topic) =>
    backendTopics.has(topic.toLowerCase())
  );

  const searchableText =
    `${repository.name} ${repository.description ?? ""}`.toLowerCase();

  const hasBackendKeyword =
    /(^|[-_\s])(backend|api|server|fastapi|django)([-_\s]|$)/i.test(
      searchableText,
    );

  return hasBackendTopic || hasBackendKeyword;
}

export default {
  fetch: withSupabase({ auth: "none" }, async (request) => {
    if (request.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (request.method !== "GET") {
      return jsonResponse(
        { error: "Only GET requests are allowed." },
        405,
      );
    }

    try {
      const repositories = await fetchGitHub<GitHubRepository[]>(
        `/user/repos?per_page=100&sort=updated&visibility=all&affiliation=owner`,
      );

      const testSummary = GITHUB_TOKEN
        ? await loadLatestBackendTestSummary(
            GITHUB_TOKEN,
            GITHUB_OWNER,
            "muhammad-tasin-portfolio",
          ).catch((error) => {
            console.error(
              "Could not load backend test summary:",
              error,
            );

            return null;
          })
        : null;

      const snapshotAt =
        testSummary?.generatedAt ??
        new Date().toISOString();

      const contributionSnapshot = GITHUB_TOKEN
        ? await loadContributionSnapshot(
            GITHUB_TOKEN,
            GITHUB_OWNER,
            snapshotAt,
          ).catch((error) => {
            console.error(
              "Could not load GitHub contribution snapshot:",
              error,
            );

            return null;
          })
        : null;

      const currentYear = new Date().getUTCFullYear();
      const yearStart =
        `${currentYear}-01-01T00:00:00Z`;

      const ownedRepositories = repositories.filter(
        (repository) =>
          !repository.fork &&
          !repository.archived,
      );

      const commitCounts = await Promise.all(
        ownedRepositories.map(async (repository) => {
          try {
            return await countGitHubItems(
              `/repos/${GITHUB_OWNER}/${repository.name}/commits` +
              `?author=${encodeURIComponent(GITHUB_OWNER)}` +
              `&since=${encodeURIComponent(yearStart)}`,
            );
          } catch (error) {
            console.error(
              `Could not count commits for ${repository.name}:`,
              error,
            );
            return 0;
          }
        }),
      );

      const authoredCommitsThisYear =
        commitCounts.reduce(
          (total, count) => total + count,
          0,
        );

      const backendRepositories = repositories
        .filter(
          (repository) =>
            !repository.fork &&
            !repository.archived &&
            isBackendRepository(repository),
        )
        .slice(0, 12);

      const repositoryStats = await Promise.all(
        backendRepositories.map(async (repository) => {
          try {
            const workflowData = await fetchGitHub<{
              workflow_runs: GitHubWorkflowRun[];
            }>(
              `/repos/${GITHUB_OWNER}/${repository.name}/actions/runs?per_page=20`,
            );

            const workflowRuns = workflowData.workflow_runs ?? [];
            const completedRuns = workflowRuns.filter(
              (run) => run.status === "completed",
            );

            const successfulRuns = completedRuns.filter(
              (run) => run.conclusion === "success",
            ).length;

            const latestRun = workflowRuns[0] ?? null;

            return {
              name: repository.name,
              description: repository.description,
              repositoryUrl: repository.html_url,
              language: repository.language,
              defaultBranch: repository.default_branch,
              lastPushedAt: repository.pushed_at,
              ci: {
                available: workflowRuns.length > 0,
                totalRecentRuns: workflowRuns.length,
                completedRecentRuns: completedRuns.length,
                successfulRecentRuns: successfulRuns,
                successRate:
                  completedRuns.length === 0
                    ? null
                    : Math.round(
                        (successfulRuns / completedRuns.length) * 100,
                      ),
                latestStatus:
                  latestRun?.conclusion ??
                  latestRun?.status ??
                  "not-configured",
                latestRunUrl: latestRun?.html_url ?? null,
                latestRunAt: latestRun?.updated_at ?? null,
                latestBranch: latestRun?.head_branch ?? null,
              },
            };
          } catch (error) {
            console.error(
              `Could not load CI for ${repository.name}:`,
              error,
            );

            return {
              name: repository.name,
              description: repository.description,
              repositoryUrl: repository.html_url,
              language: repository.language,
              defaultBranch: repository.default_branch,
              lastPushedAt: repository.pushed_at,
              ci: {
                available: false,
                totalRecentRuns: 0,
                completedRecentRuns: 0,
                successfulRecentRuns: 0,
                successRate: null,
                latestStatus: "unavailable",
                latestRunUrl: null,
                latestRunAt: null,
                latestBranch: null,
              },
            };
          }
        }),
      );

      const totalRuns = repositoryStats.reduce(
        (total, repository) =>
          total + repository.ci.totalRecentRuns,
        0,
      );

      const completedRuns = repositoryStats.reduce(
        (total, repository) =>
          total + repository.ci.completedRecentRuns,
        0,
      );

      const successfulRuns = repositoryStats.reduce(
        (total, repository) =>
          total + repository.ci.successfulRecentRuns,
        0,
      );

      return jsonResponse({
        owner: GITHUB_OWNER,
        generatedAt: snapshotAt,

        backendRepositoryCount:
          testSummary
            ?.expectedRepositoryCount ??
          repositoryStats.length,

        github: {
          year: currentYear,

          authoredCommits:
            authoredCommitsThisYear,

          longestContributionStreak:
            contributionSnapshot
              ?.longestContributionStreak ??
            null,

          activeContributionDays:
            contributionSnapshot
              ?.activeContributionDays ??
            null,

          snapshotAt:
            contributionSnapshot
              ?.snapshotAt ??
            null,
        },

        tests: testSummary
          ? {
              passed: testSummary.passed,
              failed: testSummary.failed,
              skipped: testSummary.skipped,
              total: testSummary.total,

              reportingRepositoryCount:
                testSummary
                  .reportingRepositoryCount,

              notConfiguredRepositoryCount:
                testSummary
                  .notConfiguredRepositoryCount,

              errorRepositoryCount:
                testSummary
                  .errorRepositoryCount,

              allLatestSuitesPassing:
                testSummary
                  .allReportingSuitesPassing,

              snapshotAt:
                testSummary.generatedAt,
            }
          : null,

        summary: {
          totalRecentRuns: totalRuns,
          completedRecentRuns: completedRuns,
          successfulRecentRuns: successfulRuns,
          successRate:
            completedRuns === 0
              ? null
              : Math.round(
                  (successfulRuns / completedRuns) * 100,
                ),
        },
        repositories: repositoryStats,
      });
    } catch (error) {
      console.error("backend-ci-stats failed:", error);

      return jsonResponse(
        {
          error: "Unable to load GitHub backend CI statistics.",
        },
        500,
      );
    }
  }),
};
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/backend-ci-stats' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/

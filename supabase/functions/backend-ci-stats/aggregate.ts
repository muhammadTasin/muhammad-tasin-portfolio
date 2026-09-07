import type { BackendTestSummary } from "./github_snapshot.ts";
import { loadContributionSnapshot } from "./github_contributions.ts";
import { isEvidenceSnapshot, type EvidenceSnapshot } from "../_shared/evidence.ts";

const GITHUB_OWNER = Deno.env.get("GITHUB_OWNER") ?? "muhammadTasin";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

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
    { headers, signal: AbortSignal.timeout(15_000) },
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
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}


// Called only by the authenticated nightly publisher. No visitor invokes GitHub.
export async function aggregate(summary: BackendTestSummary): Promise<EvidenceSnapshot> {
  if (!GITHUB_TOKEN) throw new Error("GitHub credentials missing");
  if (!summary || !Array.isArray(summary.repositories) ||
      summary.scannedRepositoryCount !== summary.expectedRepositoryCount ||
      summary.repositories.length !== summary.expectedRepositoryCount ||
      new Set(summary.repositories.map(r => r.repository)).size !== summary.repositories.length) {
    throw new Error("Incomplete test scan; keeping previous snapshot");
  }
  const reporting = summary.repositories.filter(r => r.status === "passing" || r.status === "failing");
  for (const key of ["passed", "failed", "skipped", "total"] as const) {
    if (reporting.some(r => !Number.isSafeInteger(r[key]) || r[key] < 0) ||
        summary[key] !== reporting.reduce((sum, r) => sum + r[key], 0)) {
      throw new Error("Invalid test totals");
    }
  }
  if (summary.reportingRepositoryCount !== reporting.length ||
      summary.allReportingSuitesPassing !== (reporting.length > 0 && reporting.every(r => r.status === "passing"))) {
    throw new Error("Invalid test reporting counts");
  }
  const snapshotAt = summary.generatedAt;
  const year = new Date(snapshotAt).getUTCFullYear();
  if (!Number.isFinite(year)) throw new Error("Invalid snapshot timestamp");

  // The workflow's current artifact has no github object. Support one when the
  // producer supplies it; otherwise collect it once here, after the nightly scan.
  let github = summary.github;
  if (!github) {
    type Repo = { name: string; fork: boolean; archived: boolean };
    const repositories: Repo[] = [];
    for (let page = 1; ; page++) {
      const batch = await fetchGitHub<Repo[]>(`/user/repos?per_page=100&visibility=all&affiliation=owner&page=${page}`);
      repositories.push(...batch.filter(r => !r.fork && !r.archived));
      if (batch.length < 100) break;
    }
    // Preserve authored-commit semantics, bounded to this snapshot's timestamp.
    // A remote failure rejects publication instead of silently inventing zero.
    let authoredCommits = 0;
    for (let i = 0; i < repositories.length; i += 5) {
      const counts = await Promise.all(repositories.slice(i, i + 5).map(r => countGitHubItems(
        `/repos/${GITHUB_OWNER}/${r.name}/commits?author=${encodeURIComponent(GITHUB_OWNER)}` +
        `&since=${year}-01-01T00:00:00Z&until=${encodeURIComponent(snapshotAt)}`,
      )));
      authoredCommits += counts.reduce((a, b) => a + b, 0);
    }
    const contributions = await loadContributionSnapshot(GITHUB_TOKEN, GITHUB_OWNER, snapshotAt);
    github = { year, authoredCommits, ...contributions };
  }
  // Only this allowlisted public projection is persisted. Private repository
  // names, descriptions, workflow URLs and raw reports never leave the refresh.
  const snapshot: EvidenceSnapshot = {
    generatedAt: snapshotAt,
    backendRepositoryCount: summary.expectedRepositoryCount,
    github: {
      year: github.year, authoredCommits: github.authoredCommits,
      longestContributionStreak: github.longestContributionStreak,
      activeContributionDays: github.activeContributionDays, snapshotAt: github.snapshotAt,
    },
    tests: {
      passed: summary.passed, failed: summary.failed, skipped: summary.skipped, total: summary.total,
      reportingRepositoryCount: summary.reportingRepositoryCount,
      allLatestSuitesPassing: summary.allReportingSuitesPassing, snapshotAt,
    },
  };
  if (!isEvidenceSnapshot(snapshot)) throw new Error("Invalid snapshot");
  return snapshot;
}

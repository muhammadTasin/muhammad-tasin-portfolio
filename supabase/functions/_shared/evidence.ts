export const FRESH_MS = 30 * 60 * 60 * 1000;
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type EvidenceSnapshot = {
  generatedAt: string;
  backendRepositoryCount: number;
  github: {
    year: number;
    authoredCommits: number;
    longestContributionStreak: number;
    activeContributionDays: number;
    snapshotAt: string;
  };
  tests: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    reportingRepositoryCount: number;
    allLatestSuitesPassing: boolean;
    snapshotAt: string;
  };
};

const count = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

export function isEvidenceSnapshot(value: unknown): value is EvidenceSnapshot {
  if (!value || typeof value !== "object") return false;
  const s = value as EvidenceSnapshot;
  const g = s.github;
  const t = s.tests;
  return typeof s.generatedAt === "string" && Number.isFinite(Date.parse(s.generatedAt)) &&
    count(s.backendRepositoryCount) && !!g && !!t &&
    count(g.year) && g.year === new Date(s.generatedAt).getUTCFullYear() &&
    count(g.authoredCommits) && count(g.longestContributionStreak) && count(g.activeContributionDays) &&
    g.longestContributionStreak <= g.activeContributionDays && g.activeContributionDays <= 366 &&
    g.snapshotAt === s.generatedAt && t.snapshotAt === s.generatedAt &&
    [t.passed, t.failed, t.skipped, t.total, t.reportingRepositoryCount].every(count) &&
    t.total === t.passed + t.failed + t.skipped &&
    t.reportingRepositoryCount <= s.backendRepositoryCount &&
    typeof t.allLatestSuitesPassing === "boolean" &&
    (!t.allLatestSuitesPassing || (t.reportingRepositoryCount > 0 && t.failed === 0));
}

export function snapshotAgeState(snapshot: EvidenceSnapshot, now = Date.now()) {
  const age = now - Date.parse(snapshot.generatedAt);
  if (age < -300_000 || age > MAX_AGE_MS) return "expired";
  return age > FRESH_MS ? "stale-success" : "success";
}

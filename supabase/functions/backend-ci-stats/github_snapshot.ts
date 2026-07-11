import {
  strFromU8,
  unzipSync,
} from "npm:fflate@0.8.2";

export type BackendTestSummary = {
  generatedAt: string;
  expectedRepositoryCount: number;
  scannedRepositoryCount: number;
  reportingRepositoryCount: number;
  notConfiguredRepositoryCount: number;
  errorRepositoryCount: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  allReportingSuitesPassing: boolean;

  github?: {
    year: number;
    authoredCommits: number;
    activeContributionDays: number;
    longestContributionStreak: number;
    snapshotAt: string;
  } | null;

  repositories: Array<{
    repository: string;
    defaultBranch: string;
    status:
      | "passing"
      | "failing"
      | "error"
      | "not-configured";
    runtime: string | null;
    workingDirectory: string | null;
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    updatedAt: string;
    message: string;
  }>;
};

type GitHubArtifact = {
  id: number;
  name: string;
  expired: boolean;
  created_at: string;
};

type ArtifactResponse = {
  artifacts: GitHubArtifact[];
};

function githubHeaders(token: string): Headers {
  return new Headers({
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "muhammad-tasin-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  });
}

export async function loadLatestBackendTestSummary(
  token: string,
  owner: string,
  repository: string,
): Promise<BackendTestSummary | null> {
  const artifactResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repository}` +
      "/actions/artifacts" +
      "?name=backend-test-summary&per_page=20",
    {
      headers: githubHeaders(token),
    },
  );

  if (!artifactResponse.ok) {
    throw new Error(
      `Artifact listing failed: ${artifactResponse.status}`,
    );
  }

  const artifactData =
    (await artifactResponse.json()) as ArtifactResponse;

  const artifact = artifactData.artifacts
    .filter(
      (item) =>
        item.name === "backend-test-summary" &&
        !item.expired,
    )
    .sort(
      (left, right) =>
        Date.parse(right.created_at) -
        Date.parse(left.created_at),
    )[0];

  if (!artifact) {
    return null;
  }

  const zipResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repository}` +
      `/actions/artifacts/${artifact.id}/zip`,
    {
      headers: githubHeaders(token),
      redirect: "follow",
    },
  );

  if (!zipResponse.ok) {
    throw new Error(
      `Artifact download failed: ${zipResponse.status}`,
    );
  }

  const archive = unzipSync(
    new Uint8Array(
      await zipResponse.arrayBuffer(),
    ),
  );

  const summaryFile = Object.entries(archive).find(
    ([name]) =>
      name.endsWith(
        "backend-test-summary.json",
      ),
  );

  if (!summaryFile) {
    throw new Error(
      "backend-test-summary.json was not found.",
    );
  }

  return JSON.parse(
    strFromU8(summaryFile[1]),
  ) as BackendTestSummary;
}

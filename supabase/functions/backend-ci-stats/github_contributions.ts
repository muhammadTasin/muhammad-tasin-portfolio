export type ContributionSnapshot = {
  activeContributionDays: number;
  longestContributionStreak: number;
  snapshotAt: string;
};

type ContributionDay = {
  date: string;
  contributionCount: number;
};

type GraphQLPayload = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: Array<{
            contributionDays: ContributionDay[];
          }>;
        };
      };
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

const CONTRIBUTION_QUERY = `
  query ContributionSnapshot(
    $login: String!
    $from: DateTime!
    $to: DateTime!
  ) {
    user(login: $login) {
      contributionsCollection(
        from: $from
        to: $to
      ) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

function calculateLongestStreak(
  dates: string[],
): number {
  const uniqueDates = Array.from(
    new Set(dates),
  ).sort();

  let longest = 0;
  let current = 0;
  let previous: string | null = null;

  for (const date of uniqueDates) {
    if (previous === null) {
      current = 1;
    } else {
      const difference =
        (
          Date.parse(`${date}T00:00:00Z`) -
          Date.parse(`${previous}T00:00:00Z`)
        ) / 86_400_000;

      current =
        difference === 1
          ? current + 1
          : 1;
    }

    longest = Math.max(longest, current);
    previous = date;
  }

  return longest;
}

export async function loadContributionSnapshot(
  token: string,
  login: string,
  snapshotAt: string,
): Promise<ContributionSnapshot> {
  const snapshotDate = new Date(snapshotAt);

  if (Number.isNaN(snapshotDate.getTime())) {
    throw new Error(
      "Invalid contribution snapshot timestamp.",
    );
  }

  const year = snapshotDate.getUTCFullYear();
  const from = `${year}-01-01T00:00:00Z`;

  const response = await fetch(
    "https://api.github.com/graphql",
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "muhammad-tasin-portfolio",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: {
          login,
          from,
          to: snapshotAt,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL request failed: ${response.status}`,
    );
  }

  const payload =
    (await response.json()) as GraphQLPayload;

  if (payload.errors?.length) {
    throw new Error(
      payload.errors
        .map((error) => error.message)
        .join("; "),
    );
  }

  const user = payload.data?.user;

  if (!user) {
    throw new Error(
      `GitHub user "${login}" was not found.`,
    );
  }

  const days =
    user.contributionsCollection
      .contributionCalendar.weeks
      .flatMap(
        (week) => week.contributionDays,
      );

  const activeDates = days
    .filter(
      (day) => day.contributionCount > 0,
    )
    .map((day) => day.date);

  return {
    activeContributionDays:
      new Set(activeDates).size,

    longestContributionStreak:
      calculateLongestStreak(activeDates),

    snapshotAt,
  };
}

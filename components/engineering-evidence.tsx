"use client";
import type { EvidenceState } from "../lib/evidence-store";

export function EngineeringEvidence({ state }: { state: EvidenceState }) {
  const loading = state.status === "loading";
  const data = state.data;
  const tests = data?.tests;
  const year = data?.github.year;
  const timestamp = data ? new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(data.generatedAt)) + " BDT" : "";
  const cards = [
    { label: "Automated tests", value: tests && tests.reportingRepositoryCount > 0 ? tests.passed.toLocaleString("en-US") : null,
      loadingText: "Loading verified test evidence", description: tests?.reportingRepositoryCount ? "Tests passing in latest suites" : "No verified test reports available" },
    { label: "Test coverage", value: tests ? String(tests.reportingRepositoryCount).padStart(2, "0") : null,
      loadingText: "Loading verified test reports", description: "Repositories publishing verified test reports" },
    { label: "Consistency", value: data ? `${data.github.longestContributionStreak}d` : null,
      loadingText: "Loading contribution history", description: `Longest contribution streak in ${year ?? "this year"}` },
    { label: "Active days", value: data ? data.github.activeContributionDays.toLocaleString("en-US") : null,
      loadingText: "Loading contribution activity", description: `Contribution days recorded in ${year ?? "this year"}` },
  ];
  return (
        <section
          className="engineering-proof-section"
          aria-labelledby="engineering-proof-title"
        >
          <div className="container">
            <div
              className="engineering-proof-heading"
              data-reveal
            >
              <div>
                <span className="eyebrow">
                  Live engineering evidence
                </span>

                <h2 id="engineering-proof-title">
                  Measured work.
                  <br />
                  <em>Not just claims.</em>
                </h2>
              </div>

              <p>
                Live signals collected from my GitHub repositories,
                automated test pipelines and contribution activity.
                Repositories without verified test reports are never
                counted as passing.
              </p>
            </div>

            <div className="engineering-proof-grid" data-reveal aria-busy={loading}>
              {cards.map((card, index) => (
                <article className="engineering-proof-card" key={card.label}>
                  <div className="engineering-proof-card-top">
                    <span className="engineering-proof-label">{card.label}</span>
                    {index === 0 ? (
                      <span className={`engineering-proof-status ${loading ? "is-collecting" : tests?.allLatestSuitesPassing ? "is-passing" : ""}`}>
                        <i aria-hidden="true" />
                        {loading ? "Collecting" : !tests ? "Unavailable" : tests.reportingRepositoryCount === 0 ? "No reports" : tests.allLatestSuitesPassing ? "Passing" : "Review"}
                      </span>
                    ) : <span className="engineering-proof-index">0{index + 1}</span>}
                  </div>
                  <strong className={`engineering-proof-value evidence-value ${loading ? "is-loading" : "is-ready"}`}>
                    <span className="evidence-skeleton" aria-hidden="true" />
                    <span className={`evidence-number ${card.value === null ? "is-unavailable" : ""}`}>
                      {loading ? <span className="evidence-sr-only">Loading</span> : card.value ?? "Unavailable"}
                    </span>
                  </strong>
                  <p>{loading ? card.loadingText : state.status === "error" ? "Live evidence could not be refreshed" : card.description}</p>
                </article>
              ))}
            </div>
            <p className="evidence-update" role="status" aria-live="polite" aria-atomic="true">
              {loading ? "Retrieving verified engineering evidence" : state.status === "error" ? "Live evidence is currently unavailable" : <>
                {state.status === "stale-success" ? "Last verified snapshot · Refresh delayed · " : "Verified snapshot · "}
                <time dateTime={data!.generatedAt}>{timestamp}</time>
              </>}
            </p>

            <p
              className="engineering-proof-note"
              data-reveal
            >
              Daily snapshot · Refreshes nightly after
              12:00 AM Bangladesh time. Missing evidence is
              shown as unavailable, never estimated.
            </p>
          </div>
        </section>

  );
}

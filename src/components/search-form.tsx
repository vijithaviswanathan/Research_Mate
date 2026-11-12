"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const demoQuery =
  "Agentic AI applications in healthcare: methods, limitations, evaluation patterns, and open research gaps";

const loadingStages = [
  "Retrieving candidate papers from academic sources.",
  "Ranking and filtering the strongest matches.",
  "Generating structured summaries and synthesis."
];

const quickQueries = [
  "Multi-agent systems for scientific discovery",
  "Retrieval-augmented generation for biomedical question answering",
  "Clinical workflow automation with agentic AI"
];

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState(demoQuery);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "loading") {
      setLoadingStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStep((current) => Math.min(current + 1, loadingStages.length - 1));
    }, 2200);

    return () => window.clearInterval(interval);
  }, [status]);

  const elapsedLabel = useMemo(() => {
    if (!startedAt || status !== "loading") {
      return null;
    }

    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    return `${seconds}s elapsed`;
  }, [startedAt, status, loadingStep]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setStartedAt(Date.now());

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      const payload = (await response.json()) as { analysisId?: string; detail?: string };

      if (!response.ok || !payload.analysisId) {
        throw new Error(payload.detail ?? "Analysis failed.");
      }

      router.push(`/results/${payload.analysisId}`);
    } catch (submitError) {
      setStatus("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Analysis failed. Please try again with a narrower topic."
      );
      return;
    }

    setStatus("idle");
    setStartedAt(null);
  }

  return (
    <form className="search-card" onSubmit={handleSubmit}>
      <label htmlFor="query" className="muted">
        Enter a research question or a focused topic. This form now posts to the analysis API.
      </label>
      <div className="quick-query-row">
        {quickQueries.map((item) => (
          <button
            key={item}
            className="query-chip"
            type="button"
            onClick={() => setQuery(item)}
            disabled={status === "loading"}
          >
            {item}
          </button>
        ))}
      </div>
      <textarea
        id="query"
        name="query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Example: retrieval-augmented generation for biomedical question answering"
      />
      <div className="actions">
        <button className="button primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Analyzing..." : "Analyze Topic"}
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => setQuery(demoQuery)}
          disabled={status === "loading"}
        >
          Reset Demo Query
        </button>
      </div>
      {status === "loading" ? (
        <section className="progress-card" aria-live="polite">
          <div className="progress-header">
            <strong>Building your literature brief</strong>
            {elapsedLabel ? <span className="muted">{elapsedLabel}</span> : null}
          </div>
          <div className="progress-track" aria-hidden="true">
            <span
              className="progress-bar"
              style={{ width: `${((loadingStep + 1) / loadingStages.length) * 100}%` }}
            />
          </div>
          <ul className="progress-list">
            {loadingStages.map((stage, index) => (
              <li
                key={stage}
                className={
                  index < loadingStep
                    ? "progress-done"
                    : index === loadingStep
                      ? "progress-active"
                      : "progress-pending"
                }
              >
                {stage}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
    </form>
  );
}

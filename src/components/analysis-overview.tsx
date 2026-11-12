type AnalysisOverviewProps = {
  paperCount: number;
  liveSummaryCount: number;
  fallbackSummaryCount: number;
  query: string;
};

export function AnalysisOverview({
  paperCount,
  liveSummaryCount,
  fallbackSummaryCount,
  query
}: AnalysisOverviewProps) {
  return (
    <section className="panel overview-band">
      <div>
        <p className="eyebrow">Analysis Snapshot</p>
        <h2>{query}</h2>
      </div>

      <div className="overview-metrics">
        <article className="metric-tile">
          <span className="metric-value">{paperCount}</span>
          <span className="metric-label">papers reviewed</span>
        </article>
        <article className="metric-tile">
          <span className="metric-value">{liveSummaryCount}</span>
          <span className="metric-label">live summaries</span>
        </article>
        <article className="metric-tile">
          <span className="metric-value">{fallbackSummaryCount}</span>
          <span className="metric-label">fallback summaries</span>
        </article>
      </div>
    </section>
  );
}

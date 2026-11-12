type PaperDetailPanelProps = {
  title: string;
  authors: string[];
  source: string;
  year: number | null;
  url: string | null;
  venue: string | null;
  abstract: string | null;
  summary: string;
  contributions: string[];
  limitations: string[];
};

export function PaperDetailPanel({
  title,
  authors,
  source,
  year,
  url,
  venue,
  abstract,
  summary,
  contributions,
  limitations
}: PaperDetailPanelProps) {
  return (
    <section className="panel detail-panel sticky-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Selected Paper</p>
          <h2>{title}</h2>
        </div>
        {url ? (
          <a className="button secondary" href={url} target="_blank" rel="noreferrer">
            Open Source
          </a>
        ) : null}
      </div>

      <div className="pill-row">
        <span className="pill">{source}</span>
        {year ? <span className="pill">{year}</span> : null}
        {venue ? <span className="pill">{venue}</span> : null}
      </div>

      <div className="detail-meta">
        <span>Paper profile</span>
      </div>

      {authors.length > 0 ? (
        <p className="muted">
          <strong>Authors:</strong> {authors.join(", ")}
        </p>
      ) : null}

      <div className="detail-grid">
        <section className="subpanel">
          <h3>Summary</h3>
          <p className="muted">{summary}</p>
        </section>

        <section className="subpanel">
          <h3>Abstract</h3>
          <p className="muted">{abstract ?? "No abstract available."}</p>
        </section>
      </div>

      <div className="detail-grid">
        <section className="subpanel">
          <h3>Key Contributions</h3>
          <ul className="bullet-list">
            {contributions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="subpanel">
          <h3>Limitations</h3>
          <ul className="bullet-list">
            {limitations.length > 0 ? (
              limitations.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No limitations were extracted for this paper.</li>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}

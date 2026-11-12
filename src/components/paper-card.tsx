type PaperCardProps = {
  title: string;
  authors: string[];
  source: string;
  year: number;
  url: string | null;
  relevanceScore: number;
  confidenceLabel: "high" | "medium" | "low";
  matchedTerms: string[];
  summary: string;
  contributions: string[];
  limitations: string[];
  summarySource: "live" | "fallback";
  selected: boolean;
  onSelect: () => void;
};

export function PaperCard({
  title,
  authors,
  source,
  year,
  url,
  relevanceScore,
  confidenceLabel,
  matchedTerms,
  summary,
  contributions,
  limitations,
  summarySource,
  selected,
  onSelect
}: PaperCardProps) {
  return (
    <article
      className={`paper-card ${selected ? "paper-card-selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="meta">
        <span>{source}</span>
        <span>{year}</span>
        <span className={`status-pill ${confidenceLabel}`}>{confidenceLabel} relevance</span>
        <span className={`status-pill ${summarySource}`}>
          {summarySource === "live" ? "live summary" : "fallback summary"}
        </span>
        <span>{relevanceScore.toFixed(2)}</span>
      </div>
      <h3>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            {title}
          </a>
        ) : (
          title
        )}
      </h3>
      {authors.length > 0 ? (
        <p className="paper-authors">{authors.slice(0, 4).join(", ")}</p>
      ) : null}
      {matchedTerms.length > 0 ? (
        <div className="pill-row">
          {matchedTerms.map((term) => (
            <span key={term} className="pill">
              {term}
            </span>
          ))}
        </div>
      ) : null}
      <p className="muted">{summary}</p>
      <ul className="bullet-list">
        {contributions.slice(0, 2).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {limitations.length > 0 ? (
        <>
          <h4 className="mini-heading">Limitations</h4>
          <ul className="bullet-list">
            {limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

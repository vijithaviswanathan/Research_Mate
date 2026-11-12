import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { listAnalysisRecords } from "@/lib/repositories/analysis-repository";

export default async function HistoryPage() {
  const history = await listAnalysisRecords();

  return (
    <main className="app-shell">
      <section className="page-header">
        <div className="page-header-topbar">
          <h1>Analysis History</h1>
          <ThemeToggle />
        </div>
        <p>
          This page reads through the persistence repository, using Prisma when the database is
          configured and a disk-backed store while local database setup is still in progress.
        </p>
      </section>

      <section className="history-grid">
        {history.map((item) => (
          <article key={item.analysisId} className="panel history-card">
            <div className="meta">
              <span>{new Date(item.createdAt).toLocaleString()}</span>
              <span className="status-pill live">completed</span>
            </div>
            <h2 style={{ marginTop: 10 }}>{item.query}</h2>
            <p className="muted history-preview">
              {item.synthesis.overview.length > 180
                ? `${item.synthesis.overview.slice(0, 180)}...`
                : item.synthesis.overview}
            </p>
            <div className="history-metrics">
              <span>{item.papers.length} papers</span>
              <span>{item.synthesis.themes.length} themes</span>
              <span>{item.synthesis.researchGaps.length} gaps</span>
            </div>
            <p className="muted">Analysis id: {item.analysisId}</p>
            <div className="actions" style={{ marginTop: 16 }}>
              <Link className="button secondary" href={`/results/${item.analysisId}`}>
                Open Results
              </Link>
              <a className="button secondary" href={`/api/export/${item.analysisId}`}>
                Export
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

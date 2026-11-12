import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultsWorkspace } from "@/components/results-workspace";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAnalysisRecord } from "@/lib/repositories/analysis-repository";

export default async function ResultsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = await getAnalysisRecord(id);

  if (!analysis) {
    notFound();
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <div className="page-header-topbar">
          <h1>Analysis Results</h1>
          <ThemeToggle />
        </div>
        <p>The current workspace is organized for quick scanning, deeper paper review, and gap spotting.</p>
        <div className="actions">
          <Link className="button secondary" href="/history">
            Back to History
          </Link>
          <a className="button secondary" href={`/api/export/${analysis.analysisId}`}>
            Export Markdown
          </a>
          <a className="button secondary" href={`/api/export/${analysis.analysisId}/docx`}>
            Export DOCX
          </a>
        </div>
      </section>
      <ResultsWorkspace analysis={analysis} />
    </main>
  );
}

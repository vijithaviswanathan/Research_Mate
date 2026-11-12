import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { ThemeToggle } from "@/components/theme-toggle";

const valueProps = [
  "Search across multiple scholarly sources",
  "Summarize top papers in a consistent format",
  "Surface trends, limitations, and open research gaps"
];

const workspaceSignals = [
  { value: "Multi-source", label: "scholarly retrieval" },
  { value: "Structured", label: "synthesis and export" },
  { value: "Persistent", label: "analysis history" }
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-topbar">
          <div className="pill-row">
            <span className="pill">Research discovery</span>
            <span className="pill">Structured synthesis</span>
            <span className="pill">Gap detection</span>
          </div>
          <ThemeToggle />
        </div>
        <h1>ResearchMate turns a research question into a usable literature brief.</h1>
        <p>
          ResearchMate searches academic sources, synthesizes the strongest papers it finds, and
          turns the result into a structured research brief you can inspect and export.
        </p>
        <div className="hero-metrics">
          {workspaceSignals.map((item) => (
            <article key={item.label} className="hero-metric-card">
              <span className="hero-metric-value">{item.value}</span>
              <span className="hero-metric-label">{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-grid">
        <div className="panel elevated-panel">
          <h2>Start an Analysis</h2>
          <SearchForm />
        </div>

        <div className="panel">
          <p className="eyebrow">Workspace Priorities</p>
          <h2>What this workspace is optimized for</h2>
          <ul className="bullet-list">
            {valueProps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="note-box">
            Best results come from focused topic prompts that include a domain, task, or research
            angle rather than a single keyword.
          </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <Link className="button secondary" href="/history">
            View Analysis History
            </Link>
            <Link className="button secondary" href="/results/demo-analysis">
              Open Demo Results
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

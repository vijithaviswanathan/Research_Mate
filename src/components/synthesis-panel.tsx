type SynthesisPanelProps = {
  overview: string;
  themes: string[];
  methodologyNote: string | null;
};

export function SynthesisPanel({ overview, themes, methodologyNote }: SynthesisPanelProps) {
  return (
    <section className="panel synthesis-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Literature Synthesis</p>
          <h2>Cross-paper overview</h2>
        </div>
      </div>
      <p className="muted">{overview}</p>
      <div className="pill-row" style={{ marginTop: 14 }}>
        {themes.map((theme) => (
          <span key={theme} className="pill">
            {theme}
          </span>
        ))}
      </div>
      {methodologyNote ? <p className="methodology-note">{methodologyNote}</p> : null}
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AnalysisResult } from "@/lib/schemas/analysis";
import { AnalysisOverview } from "@/components/analysis-overview";
import { InsightList } from "@/components/insight-list";
import { PaperCard } from "@/components/paper-card";
import { PaperDetailPanel } from "@/components/paper-detail-panel";
import { SynthesisPanel } from "@/components/synthesis-panel";

type ResultsWorkspaceProps = {
  analysis: AnalysisResult;
};

export function ResultsWorkspace({ analysis }: ResultsWorkspaceProps) {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(analysis.papers[0]?.id ?? "");

  const selectedPaper = useMemo(
    () => analysis.papers.find((paper) => paper.id === selectedPaperId) ?? analysis.papers[0],
    [analysis.papers, selectedPaperId]
  );

  const liveSummaryCount = analysis.papers.filter((paper) => paper.summarySource === "live").length;
  const fallbackSummaryCount = analysis.papers.length - liveSummaryCount;

  return (
    <>
      <AnalysisOverview
        paperCount={analysis.papers.length}
        liveSummaryCount={liveSummaryCount}
        fallbackSummaryCount={fallbackSummaryCount}
        query={analysis.query}
      />

      <section className="dashboard dashboard-top">
        <div className="stack">
          <SynthesisPanel
            overview={analysis.synthesis.overview}
            themes={analysis.synthesis.themes}
            methodologyNote={analysis.synthesis.methodologyNote}
          />

          <section className="panel stack">
            <div className="detail-header">
              <div>
                <p className="eyebrow">Retrieved Papers</p>
                <h2>Top ranked sources</h2>
              </div>
            </div>
            {analysis.papers.map((paper) => (
              <PaperCard
                key={paper.id}
                title={paper.title}
                authors={paper.authors}
                source={paper.source}
                year={paper.year ?? 0}
                url={paper.url}
                relevanceScore={paper.relevanceScore}
                confidenceLabel={paper.confidenceLabel}
                matchedTerms={paper.matchedTerms}
                summary={paper.summary}
                contributions={paper.keyContributions}
                limitations={paper.limitations}
                summarySource={paper.summarySource}
                selected={paper.id === selectedPaper?.id}
                onSelect={() => setSelectedPaperId(paper.id)}
              />
            ))}
          </section>
        </div>

        <div className="stack">
          {selectedPaper ? (
            <PaperDetailPanel
              title={selectedPaper.title}
              authors={selectedPaper.authors}
              source={selectedPaper.source}
              year={selectedPaper.year}
              url={selectedPaper.url}
              venue={selectedPaper.venue}
              abstract={selectedPaper.abstract}
              summary={selectedPaper.summary}
              contributions={selectedPaper.keyContributions}
              limitations={selectedPaper.limitations}
            />
          ) : null}
          <InsightList title="Research Trends" items={analysis.synthesis.trends} />
          <InsightList title="Research Gaps" items={analysis.synthesis.researchGaps} />
          <InsightList title="Future Directions" items={analysis.synthesis.futureDirections} />
        </div>
      </section>
    </>
  );
}

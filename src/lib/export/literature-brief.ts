import { AnalysisResult } from "@/lib/schemas/analysis";

function section(title: string, items: string[]) {
  if (items.length === 0) {
    return `## ${title}\n\n_No items available._`;
  }

  return `## ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function cleanFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getLiteratureBriefFileName(analysis: AnalysisResult) {
  const slug = cleanFileName(analysis.query) || "researchmate-brief";
  return `${slug}.md`;
}

export function renderLiteratureBrief(analysis: AnalysisResult) {
  const header = [
    `# ResearchMate Literature Brief`,
    ``,
    `**Query:** ${analysis.query}`,
    `**Analysis ID:** ${analysis.analysisId}`,
    `**Paper Count:** ${analysis.papers.length}`,
    ``
  ].join("\n");

  const synthesis = [
    `## Overview`,
    ``,
    analysis.synthesis.overview,
    ``,
    section("Themes", analysis.synthesis.themes),
    ``,
    section("Research Trends", analysis.synthesis.trends),
    ``,
    section("Research Gaps", analysis.synthesis.researchGaps),
    ``,
    section("Future Directions", analysis.synthesis.futureDirections)
  ].join("\n");

  const methodology = analysis.synthesis.methodologyNote
    ? `\n\n## Methodology Note\n\n${analysis.synthesis.methodologyNote}`
    : "";

  const papers = analysis.papers
    .map((paper, index) => {
      const meta = [
        `- Source: ${paper.source}`,
        `- Year: ${paper.year ?? "Unknown"}`,
        `- Venue: ${paper.venue ?? "Unknown"}`,
        `- Relevance Score: ${paper.relevanceScore.toFixed(2)}`,
        `- Confidence: ${paper.confidenceLabel}`,
        `- Summary Source: ${paper.summarySource}`,
        `- URL: ${paper.url ?? "Unavailable"}`
      ].join("\n");

      const contributions = paper.keyContributions.length
        ? paper.keyContributions.map((item) => `  - ${item}`).join("\n")
        : "  - No contribution notes captured.";

      const limitations = paper.limitations.length
        ? paper.limitations.map((item) => `  - ${item}`).join("\n")
        : "  - No limitations captured.";

      return [
        `### ${index + 1}. ${paper.title}`,
        ``,
        meta,
        ``,
        `**Summary**`,
        ``,
        paper.summary,
        ``,
        `**Matched Terms**`,
        ``,
        paper.matchedTerms.length > 0 ? paper.matchedTerms.join(", ") : "None recorded.",
        ``,
        `**Key Contributions**`,
        ``,
        contributions,
        ``,
        `**Limitations**`,
        ``,
        limitations
      ].join("\n");
    })
    .join("\n\n");

  return [header, synthesis + methodology, `## Papers\n\n${papers}`].join("\n\n");
}

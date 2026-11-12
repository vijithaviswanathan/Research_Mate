import { AnalysisResultSchema } from "@/lib/schemas/analysis";
import { searchArxiv } from "@/lib/sources/arxiv";
import { searchSemanticScholar } from "@/lib/sources/semantic-scholar";
import { dedupePapers } from "@/lib/ranking/dedupe";
import { isPaperEligible } from "@/lib/ranking/filter";
import { scorePaperRelevance } from "@/lib/ranking/score";
import { summarizePaper } from "@/lib/analysis/summarize-paper";
import { synthesizeResults } from "@/lib/analysis/synthesize-results";
import { saveAnalysisRecord } from "@/lib/repositories/analysis-repository";
import { buildSearchPhrases } from "@/lib/query/expand-query";
import { getConfidenceLabel, getMatchedTerms } from "@/lib/ranking/paper-insights";
import { isFallbackPaper } from "@/lib/sources/fetch-utils";

export async function analyzeResearchQuery(query: string) {
  const expanded = buildSearchPhrases(query);

  const [arxivPapers, semanticScholarPapers] = await Promise.all([
    searchArxiv(expanded.normalized),
    searchSemanticScholar(expanded.normalized)
  ]);

  const rawCandidates = dedupePapers([...arxivPapers, ...semanticScholarPapers]);
  const liveCandidates = rawCandidates.filter((paper) => !isFallbackPaper(paper));
  const allCandidates = liveCandidates.length > 0 ? liveCandidates : rawCandidates;
  const eligibleCandidates = allCandidates.filter((paper) => isPaperEligible(query, paper));
  const finalCandidates = eligibleCandidates.length > 0 ? eligibleCandidates : allCandidates;

  const ranked = finalCandidates
    .map((paper) => ({
      paper,
      relevanceScore: scorePaperRelevance(query, paper)
    }))
    .sort((left, right) => right.relevanceScore - left.relevanceScore)
    .slice(0, 12);

  const summarizedPapers = await Promise.all(
    ranked.map(async ({ paper, relevanceScore }, index) => {
      const summary = await summarizePaper(paper);

      return {
        id: `${paper.source.toLowerCase()}-${index + 1}`,
        ...paper,
        relevanceScore,
        confidenceLabel: getConfidenceLabel(relevanceScore),
        matchedTerms: getMatchedTerms(query, paper),
        summary: summary.summary,
        keyContributions: summary.keyContributions,
        limitations: summary.limitations,
        summarySource: summary.summarySource
      };
    })
  );

  const synthesis = await synthesizeResults(
    query,
    summarizedPapers.map(({ id: _id, relevanceScore: _score, summary, keyContributions, limitations, ...paper }) => paper)
  );

  const analysis = AnalysisResultSchema.parse({
    analysisId: `analysis-${Date.now()}`,
    query,
    papers: summarizedPapers,
    synthesis
  });

  await saveAnalysisRecord(analysis);

  return analysis;
}

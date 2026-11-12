import { PaperRecord } from "@/lib/schemas/paper";
import { tokenizeQuery } from "@/lib/query/expand-query";
import { sourcePriority } from "@/lib/ranking/source-priority";

function countMatches(queryTokens: string[], value: string | null) {
  if (!value) {
    return 0;
  }

  const haystack = value.toLowerCase();
  return queryTokens.filter((token) => haystack.includes(token)).length;
}

export function scorePaperRelevance(query: string, paper: PaperRecord) {
  const tokens = tokenizeQuery(query);

  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTitle = paper.title.toLowerCase();
  const titleMatches = countMatches(tokens, paper.title) * 2.2;
  const abstractMatches = countMatches(tokens, paper.abstract) * 1.15;
  const exactPhraseBonus = normalizedTitle.includes(normalizedQuery) ? 2.4 : 0;
  const tokenCoverage = tokens.length === 0 ? 0 : countMatches(tokens, paper.title) / tokens.length;
  const citationBonus = Math.min((paper.citationCount ?? 0) / 200, 1.4);
  const recencyBonus = paper.year ? Math.max(0, (paper.year - 2019) * 0.09) : 0;
  const abstractBonus = paper.abstract ? 0.3 : -0.2;
  const venueBonus = paper.venue ? 0.08 : 0;
  const sourceBonus = sourcePriority(paper);

  return Number(
    (
      titleMatches +
      abstractMatches +
      exactPhraseBonus +
      tokenCoverage +
      citationBonus +
      recencyBonus +
      abstractBonus +
      venueBonus +
      sourceBonus
    ).toFixed(3)
  );
}

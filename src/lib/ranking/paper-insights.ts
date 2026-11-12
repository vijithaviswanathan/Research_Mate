import { tokenizeQuery } from "@/lib/query/expand-query";
import { PaperRecord } from "@/lib/schemas/paper";

export function getMatchedTerms(query: string, paper: PaperRecord) {
  const tokens = tokenizeQuery(query);
  const haystack = `${paper.title} ${paper.abstract ?? ""}`.toLowerCase();

  return tokens.filter((token) => haystack.includes(token)).slice(0, 6);
}

export function getConfidenceLabel(score: number) {
  if (score >= 8) {
    return "high" as const;
  }

  if (score >= 5) {
    return "medium" as const;
  }

  return "low" as const;
}

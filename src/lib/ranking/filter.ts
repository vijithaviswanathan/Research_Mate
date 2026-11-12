import { hasHealthcareIntent, tokenizeQuery } from "@/lib/query/expand-query";
import { PaperRecord } from "@/lib/schemas/paper";

function normalizedHaystack(paper: PaperRecord) {
  return `${paper.title} ${paper.abstract ?? ""}`.toLowerCase();
}

function countTokenCoverage(query: string, paper: PaperRecord) {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return 0;
  }

  const haystack = normalizedHaystack(paper);
  const matches = tokens.filter((token) => haystack.includes(token));
  return matches.length / tokens.length;
}

function hasHealthcareSignals(paper: PaperRecord) {
  const haystack = normalizedHaystack(paper);
  return [
    "health",
    "healthcare",
    "clinical",
    "medical",
    "patient",
    "hospital",
    "biomedical"
  ].some((term) => haystack.includes(term));
}

export function isPaperEligible(query: string, paper: PaperRecord) {
  const coverage = countTokenCoverage(query, paper);
  const queryIsHealthcare = hasHealthcareIntent(query);
  const healthcareAligned = !queryIsHealthcare || hasHealthcareSignals(paper);
  const minimumCoverage = queryIsHealthcare ? 0.2 : 0.15;

  const titleOnlyCoverage = tokenizeQuery(query).filter((token) =>
    paper.title.toLowerCase().includes(token)
  ).length;

  return healthcareAligned && (coverage >= minimumCoverage || titleOnlyCoverage >= 2);
}

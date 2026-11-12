const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "using",
  "with"
]);

function unique(items: string[]) {
  return [...new Set(items)];
}

export function tokenizeQuery(query: string) {
  return unique(
    query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

export function buildSearchPhrases(query: string) {
  const normalized = query.trim().replace(/\s+/g, " ");
  const tokens = tokenizeQuery(query);
  const compact = tokens.slice(0, 6);

  const phrases = unique([
    normalized,
    compact.join(" "),
    compact.slice(0, 4).join(" "),
    compact.slice(0, 3).join(" ")
  ]).filter((phrase) => phrase.length > 0);

  return {
    normalized,
    tokens,
    phrases
  };
}

export function buildArxivSearchQuery(query: string) {
  const { phrases, tokens } = buildSearchPhrases(query);
  const phraseClauses = phrases.slice(0, 2).map((phrase) => `all:"${phrase}"`);
  const tokenClauses = tokens.slice(0, 4).map((token) => `all:${token}`);

  return [...phraseClauses, ...tokenClauses].join(" OR ");
}

export function hasHealthcareIntent(query: string) {
  const tokens = tokenizeQuery(query);
  const healthcareTerms = [
    "health",
    "healthcare",
    "clinical",
    "medical",
    "medicine",
    "hospital",
    "patient",
    "biomedical"
  ];

  return healthcareTerms.some((term) => tokens.includes(term));
}

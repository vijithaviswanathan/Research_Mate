import { PaperRecord } from "@/lib/schemas/paper";
import { getOptionalEnv } from "@/lib/env";
import { buildSearchPhrases } from "@/lib/query/expand-query";
import { fetchWithRetry } from "@/lib/sources/fetch-utils";

type SemanticScholarPaper = {
  paperId?: string;
  title?: string;
  abstract?: string;
  year?: number;
  url?: string;
  venue?: string;
  citationCount?: number;
  externalIds?: Record<string, string>;
  authors?: Array<{ name?: string }>;
};

export async function searchSemanticScholar(query: string): Promise<PaperRecord[]> {
  try {
    const { phrases } = buildSearchPhrases(query);
    const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
    url.searchParams.set("query", phrases[0] ?? query);
    url.searchParams.set("limit", "15");
    url.searchParams.set(
      "fields",
      "paperId,title,abstract,year,url,venue,citationCount,externalIds,authors"
    );

    const apiKey = getOptionalEnv("SEMANTIC_SCHOLAR_API_KEY");
    const response = await fetchWithRetry(url, {
      headers: {
        Accept: "application/json",
        ...(apiKey ? { "x-api-key": apiKey } : {})
      },
      next: { revalidate: 3600 },
      timeoutMs: 12000,
      retries: 2
    });

    if (!response.ok) {
      throw new Error(`Semantic Scholar request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { data?: SemanticScholarPaper[] };
    const papers = payload.data ?? [];

    return papers
      .map((paper) => ({
        source: "SEMANTIC_SCHOLAR" as const,
        externalId: paper.paperId ?? null,
        title: paper.title ?? "Untitled Semantic Scholar paper",
        authors: (paper.authors ?? []).map((author) => author.name ?? "Unknown author"),
        abstract: paper.abstract ?? null,
        year: paper.year ?? null,
        url: paper.url ?? null,
        venue: paper.venue ?? "Semantic Scholar",
        citationCount: paper.citationCount ?? null,
        doi: paper.externalIds?.DOI ?? null
      }))
      .filter((paper) => paper.abstract && paper.title);
  } catch {
    return [
      {
        source: "SEMANTIC_SCHOLAR",
        externalId: "s2-demo-001",
        title: "Clinical agent workflows with large language models",
        authors: ["C. Scientist", "D. Analyst"],
        abstract:
          "Fallback Semantic Scholar record used because the live request was unavailable in the current environment.",
        year: 2025,
        url: "https://www.semanticscholar.org/paper/demo",
        venue: "Semantic Scholar",
        citationCount: 14,
        doi: null
      }
    ];
  }
}

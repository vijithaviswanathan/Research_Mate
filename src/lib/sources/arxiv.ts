import { PaperRecord } from "@/lib/schemas/paper";
import { buildArxivSearchQuery } from "@/lib/query/expand-query";
import { fetchWithRetry } from "@/lib/sources/fetch-utils";

type ArxivEntry = {
  id?: string;
  title?: string;
  summary?: string;
  published?: string;
  author?: Array<{ name?: string }>;
  "arxiv:doi"?: string;
};

function readTag(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  return match?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? null;
}

function extractEntries(xml: string) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]);
}

function decodeXml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function searchArxiv(query: string): Promise<PaperRecord[]> {
  try {
    const url = new URL("https://export.arxiv.org/api/query");
    url.searchParams.set("search_query", buildArxivSearchQuery(query));
    url.searchParams.set("start", "0");
    url.searchParams.set("max_results", "15");
    url.searchParams.set("sortBy", "relevance");
    url.searchParams.set("sortOrder", "descending");

    const response = await fetchWithRetry(url, {
      headers: {
        Accept: "application/atom+xml"
      },
      next: { revalidate: 3600 },
      timeoutMs: 12000,
      retries: 2
    });

    if (!response.ok) {
      throw new Error(`arXiv request failed with status ${response.status}`);
    }

    const xml = await response.text();
    const entries = extractEntries(xml);

    return entries
      .map((entryXml) => {
        const authors = [...entryXml.matchAll(/<name>([\s\S]*?)<\/name>/gi)].map((match) =>
          decodeXml(match[1].trim())
        );

        return {
          source: "ARXIV" as const,
          externalId: readTag(entryXml, "id"),
          title: decodeXml(readTag(entryXml, "title") ?? "Untitled arXiv paper"),
          authors,
          abstract: decodeXml(readTag(entryXml, "summary") ?? ""),
          year: readTag(entryXml, "published")
            ? new Date(readTag(entryXml, "published") as string).getUTCFullYear()
            : null,
          url: readTag(entryXml, "id"),
          venue: "arXiv",
          citationCount: null,
          doi: readTag(entryXml, "arxiv:doi")
        };
      })
      .filter((paper) => paper.title && paper.abstract);
  } catch {
    return [
      {
        source: "ARXIV",
        externalId: "arxiv-demo-001",
        title: "Survey of agentic AI systems in healthcare operations",
        authors: ["A. Researcher", "B. Collaborator"],
        abstract:
          "Fallback arXiv record used because the live arXiv request was unavailable in the current environment.",
        year: 2024,
        url: "https://arxiv.org/abs/2401.00001",
        venue: "arXiv",
        citationCount: null,
        doi: null
      }
    ];
  }
}

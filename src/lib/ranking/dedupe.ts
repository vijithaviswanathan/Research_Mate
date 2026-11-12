import { PaperRecord } from "@/lib/schemas/paper";

function normalizeTitle(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function dedupePapers(papers: PaperRecord[]) {
  const seen = new Map<string, PaperRecord>();

  for (const paper of papers) {
    const key = paper.doi ?? paper.externalId ?? normalizeTitle(paper.title);
    if (!seen.has(key)) {
      seen.set(key, paper);
    }
  }

  return [...seen.values()];
}

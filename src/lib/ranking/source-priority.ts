import { PaperRecord } from "@/lib/schemas/paper";

export function sourcePriority(paper: PaperRecord) {
  switch (paper.source) {
    case "SEMANTIC_SCHOLAR":
      return 0.18;
    case "ARXIV":
      return 0.12;
    default:
      return 0;
  }
}

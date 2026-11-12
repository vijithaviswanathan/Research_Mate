import { PaperRecord } from "@/lib/schemas/paper";
import { PaperSummarySchema } from "@/lib/schemas/analysis";
import { generateStructuredObject } from "@/lib/llm/openai";

export async function summarizePaper(paper: PaperRecord) {
  if (!paper.abstract) {
    return PaperSummarySchema.parse({
      summary: "Abstract unavailable, so the system could not generate a full faithful summary yet.",
      keyContributions: ["Metadata retrieved successfully for downstream ranking and synthesis."],
      limitations: ["No abstract was available from the upstream source."],
      summarySource: "fallback"
    });
  }

  try {
    return await generateStructuredObject({
      schemaName: "paper_summary",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: { type: "string" },
          keyContributions: {
            type: "array",
            items: { type: "string" },
            minItems: 1
          },
          limitations: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["summary", "keyContributions", "limitations"]
      },
      fallback: {
        summary: paper.abstract,
        keyContributions: [
          `Summarizes the main idea of ${paper.title}.`,
          "Provides enough context to compare this paper against the rest of the retrieval set."
        ],
        limitations: ["Generated fallback summary because structured model output was unavailable."],
        summarySource: "fallback"
      },
      prompt: [
        "You are generating a faithful paper summary for a research assistant product.",
        "Use only the supplied metadata and abstract.",
        "Do not invent findings, metrics, datasets, or citations.",
        "Return concise JSON only.",
        `Title: ${paper.title}`,
        `Source: ${paper.source}`,
        `Year: ${paper.year ?? "Unknown"}`,
        `Abstract: ${paper.abstract}`
      ].join("\n")
    }).then((result) =>
      PaperSummarySchema.parse({
        ...result,
        summarySource: "live"
      })
    );
  } catch {
    return PaperSummarySchema.parse({
      summary: paper.abstract,
      keyContributions: [
        `Summarizes the main idea of ${paper.title}.`,
        "Provides enough context to compare this paper against the rest of the retrieval set."
      ],
      limitations: ["Generated fallback summary because structured model output was unavailable."],
      summarySource: "fallback"
    });
  }
}

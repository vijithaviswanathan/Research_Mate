import { generateStructuredObject } from "@/lib/llm/openai";
import { SynthesisSchema } from "@/lib/schemas/analysis";
import { PaperRecord } from "@/lib/schemas/paper";

export async function synthesizeResults(query: string, papers: PaperRecord[]) {
  const paperDigest = papers
    .map(
      (paper, index) =>
        `${index + 1}. ${paper.title} | ${paper.year ?? "Unknown"} | ${paper.source}\nAbstract: ${
          paper.abstract ?? "Unavailable"
        }`
    )
    .join("\n\n");

  try {
    return await generateStructuredObject({
      schemaName: "research_synthesis",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          overview: { type: "string" },
          themes: { type: "array", items: { type: "string" }, minItems: 1 },
          trends: { type: "array", items: { type: "string" }, minItems: 1 },
          researchGaps: { type: "array", items: { type: "string" }, minItems: 1 },
          futureDirections: { type: "array", items: { type: "string" }, minItems: 1 },
          methodologyNote: { type: ["string", "null"] }
        },
        required: [
          "overview",
          "themes",
          "trends",
          "researchGaps",
          "futureDirections",
          "methodologyNote"
        ]
      },
      fallback: {
        overview: `ResearchMate found ${papers.length} candidate papers for "${query}" and generated a fallback synthesis because live structured model output was unavailable.`,
        themes: ["Literature discovery", "Structured summaries", "Research gap detection"],
        trends: [
          "Cross-source retrieval improves coverage for emerging research topics.",
          "Users benefit when summaries are standardized across papers."
        ],
        researchGaps: [
          "Many topics still lack consistent evaluation across papers.",
          "Abstract-only synthesis can miss details that require full-text review."
        ],
        futureDirections: [
          "Add deeper ranking and citation-aware analysis.",
          "Support exportable literature briefs and annotated reading lists."
        ],
        methodologyNote:
          "Fallback synthesis used because the OpenAI response or API key was unavailable."
      },
      prompt: [
        "You are synthesizing literature for a research assistant product.",
        "Use only the supplied paper metadata and abstracts.",
        "Do not invent studies, citations, or results not present in the inputs.",
        `Research query: ${query}`,
        `Papers:\n${paperDigest}`
      ].join("\n\n")
    }).then((result) => SynthesisSchema.parse(result));
  } catch {
    return SynthesisSchema.parse({
      overview: `ResearchMate found ${papers.length} candidate papers for "${query}" and generated a fallback synthesis because live structured model output was unavailable.`,
      themes: ["Literature discovery", "Structured summaries", "Research gap detection"],
      trends: [
        "Cross-source retrieval improves coverage for emerging research topics.",
        "Users benefit when summaries are standardized across papers."
      ],
      researchGaps: [
        "Many topics still lack consistent evaluation across papers.",
        "Abstract-only synthesis can miss details that require full-text review."
      ],
      futureDirections: [
        "Add deeper ranking and citation-aware analysis.",
        "Support exportable literature briefs and annotated reading lists."
      ],
      methodologyNote:
        "Fallback synthesis used because the OpenAI response or API key was unavailable."
    });
  }
}

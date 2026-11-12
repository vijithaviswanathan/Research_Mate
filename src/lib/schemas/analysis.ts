import { z } from "zod";
import { PaperSchema } from "@/lib/schemas/paper";

export const AnalyzeRequestSchema = z.object({
  query: z.string().trim().min(10).max(500)
});

export const PaperSummarySchema = z.object({
  summary: z.string().min(1),
  keyContributions: z.array(z.string()).min(1),
  limitations: z.array(z.string()).default([]),
  summarySource: z.enum(["live", "fallback"]).default("fallback")
});

export const SynthesisSchema = z.object({
  overview: z.string().min(1),
  themes: z.array(z.string()).min(1),
  trends: z.array(z.string()).min(1),
  researchGaps: z.array(z.string()).min(1),
  futureDirections: z.array(z.string()).min(1),
  methodologyNote: z.string().nullable()
});

export const AnalysisResultSchema = z.object({
  analysisId: z.string(),
  query: z.string(),
  papers: z.array(
    PaperSchema.extend({
      id: z.string(),
      relevanceScore: z.number(),
      confidenceLabel: z.enum(["high", "medium", "low"]),
      matchedTerms: z.array(z.string()),
      summary: z.string(),
      keyContributions: z.array(z.string()),
      limitations: z.array(z.string()),
      summarySource: z.enum(["live", "fallback"])
    })
  ),
  synthesis: SynthesisSchema
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

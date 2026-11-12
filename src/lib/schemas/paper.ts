import { z } from "zod";

export const PaperSourceSchema = z.enum(["ARXIV", "SEMANTIC_SCHOLAR"]);

export const PaperSchema = z.object({
  source: PaperSourceSchema,
  externalId: z.string().nullable(),
  title: z.string().min(1),
  authors: z.array(z.string()),
  abstract: z.string().nullable(),
  year: z.number().int().nullable(),
  url: z.string().url().nullable(),
  venue: z.string().nullable(),
  citationCount: z.number().int().nullable(),
  doi: z.string().nullable()
});

export type PaperRecord = z.infer<typeof PaperSchema>;

import { NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schemas/analysis";
import { analyzeResearchQuery } from "@/lib/analysis/analyze-research-query";

export async function POST(request: Request) {
  try {
    const payload = AnalyzeRequestSchema.parse(await request.json());
    const result = await analyzeResearchQuery(payload.query);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Analyze route failed", error);

    return NextResponse.json(
      {
        error: "Unable to analyze the research query.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { getAnalysisRecord } from "@/lib/repositories/analysis-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const analysis = await getAnalysisRecord(id);

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  return NextResponse.json(analysis);
}

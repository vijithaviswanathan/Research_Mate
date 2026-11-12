import { NextResponse } from "next/server";
import { renderLiteratureBrief, getLiteratureBriefFileName } from "@/lib/export/literature-brief";
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

  const content = renderLiteratureBrief(analysis);
  const fileName = getLiteratureBriefFileName(analysis);

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`
    }
  });
}

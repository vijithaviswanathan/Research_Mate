import { NextResponse } from "next/server";
import { renderLiteratureBriefDocx } from "@/lib/export/docx-export";
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

  try {
    const { fileName, bytes } = await renderLiteratureBriefDocx(analysis);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "DOCX export failed.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

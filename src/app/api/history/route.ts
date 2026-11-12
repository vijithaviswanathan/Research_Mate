import { NextResponse } from "next/server";
import { listAnalysisRecords } from "@/lib/repositories/analysis-repository";

export async function GET() {
  return NextResponse.json({
    items: await listAnalysisRecords()
  });
}

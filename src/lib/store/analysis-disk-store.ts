import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { AnalysisResult } from "@/lib/schemas/analysis";
import { getAnalysisById, listAnalyses, saveAnalysis } from "@/lib/store/analysis-store";

type StoredAnalysis = AnalysisResult & {
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const analysesFilePath = path.join(dataDirectory, "analyses.json");

async function ensureDataDirectory() {
  await mkdir(dataDirectory, { recursive: true });
}

function sortAnalyses(items: StoredAnalysis[]) {
  return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function readDiskAnalyses(): Promise<StoredAnalysis[]> {
  try {
    const raw = await readFile(analysesFilePath, "utf8");
    const parsed = JSON.parse(raw) as StoredAnalysis[];
    return sortAnalyses(parsed);
  } catch (error) {
    const seeded = listAnalyses();
    if ("code" in (error as object) && (error as { code?: string }).code === "ENOENT") {
      await writeDiskAnalyses(seeded);
      return sortAnalyses(seeded);
    }

    console.error("Failed to read analysis disk store, falling back to in-memory seed.", error);
    return sortAnalyses(seeded);
  }
}

export async function writeDiskAnalyses(items: StoredAnalysis[]) {
  await ensureDataDirectory();
  await writeFile(analysesFilePath, JSON.stringify(sortAnalyses(items), null, 2), "utf8");
}

export async function saveAnalysisToDisk(analysis: AnalysisResult) {
  saveAnalysis(analysis);

  const existing = await readDiskAnalyses();
  const nextRecord: StoredAnalysis = {
    ...analysis,
    createdAt: new Date().toISOString()
  };

  const nextItems = sortAnalyses([
    nextRecord,
    ...existing.filter((item) => item.analysisId !== analysis.analysisId)
  ]);

  await writeDiskAnalyses(nextItems);
}

export async function getAnalysisFromDisk(id: string) {
  const analyses = await readDiskAnalyses();
  return analyses.find((analysis) => analysis.analysisId === id) ?? getAnalysisById(id);
}

export async function listAnalysesFromDisk() {
  return readDiskAnalyses();
}

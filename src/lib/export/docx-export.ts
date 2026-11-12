import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { AnalysisResult } from "@/lib/schemas/analysis";
import { getLiteratureBriefFileName } from "@/lib/export/literature-brief";

const execFileAsync = promisify(execFile);

function candidatePythonPaths() {
  const home = os.homedir();
  return [
    process.env.DOCX_PYTHON_BIN,
    path.join(
      home,
      ".cache",
      "codex-runtimes",
      "codex-primary-runtime",
      "dependencies",
      "python",
      "python.exe"
    ),
    "python"
  ].filter((value): value is string => Boolean(value));
}

async function resolvePythonExecutable() {
  const candidates = candidatePythonPaths();

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, ["-c", "import docx; print('ok')"]);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("No usable Python runtime with python-docx was found for DOCX export.");
}

export async function renderLiteratureBriefDocx(analysis: AnalysisResult) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "researchmate-docx-"));
  const inputPath = path.join(tempDir, "analysis.json");
  const outputPath = path.join(tempDir, getLiteratureBriefFileName(analysis).replace(/\.md$/i, ".docx"));
  const scriptPath = path.join(process.cwd(), "scripts", "build_literature_brief_docx.py");
  const pythonBin = await resolvePythonExecutable();

  try {
    await writeFile(inputPath, JSON.stringify(analysis, null, 2), "utf8");
    await execFileAsync(pythonBin, [scriptPath, inputPath, outputPath], {
      cwd: process.cwd(),
      windowsHide: true
    });

    const fileBuffer = await readFile(outputPath);
    return {
      fileName: path.basename(outputPath),
      bytes: fileBuffer
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

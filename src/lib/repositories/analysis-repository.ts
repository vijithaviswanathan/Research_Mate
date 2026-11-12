import { AnalysisResult } from "@/lib/schemas/analysis";
import { getPrismaClient } from "@/lib/db/prisma";
import {
  getAnalysisFromDisk,
  listAnalysesFromDisk,
  saveAnalysisToDisk
} from "@/lib/store/analysis-disk-store";
import { getAnalysisById, listAnalyses, saveAnalysis } from "@/lib/store/analysis-store";

type StoredAnalysis = AnalysisResult & {
  createdAt: string;
};

function hasDatabaseConfig() {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    return false;
  }

  if (
    value.includes("USER:PASSWORD@HOST") ||
    value.includes("postgresql://USER:PASSWORD@HOST") ||
    value.includes("sqlite://USER:PASSWORD@HOST")
  ) {
    return false;
  }

  return true;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function persistPaper(queryId: string, paper: AnalysisResult["papers"][number], rank: number) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return;
  }

  const paperLookupConditions: Array<Record<string, string>> = [];
  if (paper.doi) {
    paperLookupConditions.push({ doi: paper.doi });
  }
  paperLookupConditions.push({ title: paper.title });

  const existingPaper =
    paper.externalId != null
      ? await prisma.paper.findFirst({
          where: {
            source: paper.source,
            externalId: paper.externalId
          }
        })
      : await prisma.paper.findFirst({
          where: {
            OR: paperLookupConditions
          }
        });

  const paperRecord =
    existingPaper ??
    (await prisma.paper.create({
      data: {
        source: paper.source,
        externalId: paper.externalId,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        year: paper.year,
        url: paper.url,
        venue: paper.venue,
        citationCount: paper.citationCount,
        doi: paper.doi
      }
    }));

  await prisma.queryPaper.upsert({
    where: {
      queryId_paperId: {
        queryId,
        paperId: paperRecord.id
      }
    },
    update: {
      relevanceScore: paper.relevanceScore,
      rank,
      summary: paper.summary,
      keyContributions: paper.keyContributions,
      limitations: paper.limitations
    },
    create: {
      queryId,
      paperId: paperRecord.id,
      relevanceScore: paper.relevanceScore,
      rank,
      summary: paper.summary,
      keyContributions: paper.keyContributions,
      limitations: paper.limitations
    }
  });
}

async function saveAnalysisToDatabase(analysis: AnalysisResult) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return;
  }

  const queryId = analysis.analysisId;

  await prisma.researchQuery.upsert({
    where: { id: queryId },
    update: {
      queryText: analysis.query,
      status: "COMPLETED"
    },
    create: {
      id: queryId,
      queryText: analysis.query,
      status: "COMPLETED"
    }
  });

  await Promise.all(
    analysis.papers.map((paper, index) => persistPaper(queryId, paper, index + 1))
  );

  await prisma.analysisReport.upsert({
    where: {
      queryId
    },
    update: {
      overview: analysis.synthesis.overview,
      themes: analysis.synthesis.themes,
      trends: analysis.synthesis.trends,
      researchGaps: analysis.synthesis.researchGaps,
      futureDirections: analysis.synthesis.futureDirections,
      methodologyNote: analysis.synthesis.methodologyNote
    },
    create: {
      queryId,
      overview: analysis.synthesis.overview,
      themes: analysis.synthesis.themes,
      trends: analysis.synthesis.trends,
      researchGaps: analysis.synthesis.researchGaps,
      futureDirections: analysis.synthesis.futureDirections,
      methodologyNote: analysis.synthesis.methodologyNote
    }
  });
}

function mapStoredAnalysis(record: any): StoredAnalysis {
  return {
    analysisId: record.id,
    createdAt: record.createdAt.toISOString(),
    query: record.queryText,
    papers: (record.papers ?? [])
      .sort((left: any, right: any) => (left.rank ?? 0) - (right.rank ?? 0))
      .map((queryPaper: any) => ({
        id: queryPaper.paper.id,
        source: queryPaper.paper.source,
        externalId: queryPaper.paper.externalId,
        title: queryPaper.paper.title,
        authors: asStringArray(queryPaper.paper.authors),
        abstract: queryPaper.paper.abstract,
        year: queryPaper.paper.year,
        url: queryPaper.paper.url,
        venue: queryPaper.paper.venue,
        citationCount: queryPaper.paper.citationCount,
        doi: queryPaper.paper.doi,
        relevanceScore: queryPaper.relevanceScore ?? 0,
        confidenceLabel:
          (queryPaper.relevanceScore ?? 0) >= 8
            ? "high"
            : (queryPaper.relevanceScore ?? 0) >= 5
              ? "medium"
              : "low",
        matchedTerms: [],
        summary: queryPaper.summary ?? "",
        keyContributions: asStringArray(queryPaper.keyContributions),
        limitations: asStringArray(queryPaper.limitations),
        summarySource: asStringArray(queryPaper.limitations).some((item) =>
          item.toLowerCase().includes("fallback")
        )
          ? "fallback"
          : "live"
      })),
    synthesis: {
      overview: record.report?.overview ?? "",
      themes: asStringArray(record.report?.themes),
      trends: asStringArray(record.report?.trends),
      researchGaps: asStringArray(record.report?.researchGaps),
      futureDirections: asStringArray(record.report?.futureDirections),
      methodologyNote: record.report?.methodologyNote ?? null
    }
  };
}

async function getAnalysisFromDatabase(id: string) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return null;
  }

  const record = await prisma.researchQuery.findUnique({
    where: { id },
    include: {
      report: true,
      papers: {
        include: {
          paper: true
        }
      }
    }
  });

  return record ? mapStoredAnalysis(record) : null;
}

async function listAnalysesFromDatabase() {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return [];
  }

  const records = await prisma.researchQuery.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      report: true,
      papers: {
        include: {
          paper: true
        }
      }
    }
  });

  return records.map(mapStoredAnalysis);
}

export async function saveAnalysisRecord(analysis: AnalysisResult) {
  await saveAnalysisToDisk(analysis);

  if (!hasDatabaseConfig()) {
    return;
  }

  try {
    await saveAnalysisToDatabase(analysis);
  } catch (error) {
    console.error("Failed to persist analysis to database, kept in memory instead.", error);
  }
}

export async function getAnalysisRecord(id: string) {
  if (!hasDatabaseConfig()) {
    return getAnalysisFromDisk(id);
  }

  try {
    return await getAnalysisFromDatabase(id);
  } catch (error) {
    console.error("Failed to read analysis from database, falling back to memory.", error);
    return getAnalysisFromDisk(id);
  }
}

export async function listAnalysisRecords() {
  if (!hasDatabaseConfig()) {
    return listAnalysesFromDisk();
  }

  try {
    return await listAnalysesFromDatabase();
  } catch (error) {
    console.error("Failed to list analyses from database, falling back to memory.", error);
    return listAnalysesFromDisk();
  }
}

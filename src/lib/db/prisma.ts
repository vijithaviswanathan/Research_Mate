type JsonRecord = Record<string, unknown>;

type QueryPaperRecord = {
  id: string;
  queryId: string;
  paperId: string;
  relevanceScore?: number | null;
  rank?: number | null;
  summary?: string | null;
  keyContributions?: unknown;
  limitations?: unknown;
  paper: PaperRecord;
};

type PaperRecord = {
  id: string;
  source: string;
  externalId?: string | null;
  title: string;
  authors: unknown;
  abstract?: string | null;
  year?: number | null;
  url?: string | null;
  venue?: string | null;
  citationCount?: number | null;
  doi?: string | null;
};

type ResearchQueryRecord = {
  id: string;
  queryText: string;
  status: string;
  createdAt: Date;
  report?: {
    overview: string;
    themes: unknown;
    trends: unknown;
    researchGaps: unknown;
    futureDirections: unknown;
    methodologyNote?: string | null;
  } | null;
  papers?: QueryPaperRecord[];
};

export type PrismaLikeClient = {
  paper: {
    findFirst(args: JsonRecord): Promise<PaperRecord | null>;
    create(args: JsonRecord): Promise<PaperRecord>;
  };
  queryPaper: {
    upsert(args: JsonRecord): Promise<unknown>;
  };
  researchQuery: {
    upsert(args: JsonRecord): Promise<ResearchQueryRecord>;
    findUnique(args: JsonRecord): Promise<ResearchQueryRecord | null>;
    findMany(args: JsonRecord): Promise<ResearchQueryRecord[]>;
  };
  analysisReport: {
    upsert(args: JsonRecord): Promise<unknown>;
  };
};

let prismaPromise: Promise<PrismaLikeClient | null> | null = null;
const importModule = new Function("specifier", "return import(specifier)") as (
  specifier: string
) => Promise<unknown>;

export async function getPrismaClient(): Promise<PrismaLikeClient | null> {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (
    !databaseUrl ||
    databaseUrl.includes("USER:PASSWORD@HOST") ||
    databaseUrl.includes("postgresql://USER:PASSWORD@HOST") ||
    databaseUrl.includes("sqlite://USER:PASSWORD@HOST")
  ) {
    return null;
  }

  if (!prismaPromise) {
    prismaPromise = (async () => {
      try {
        const module = (await importModule("@prisma/client")) as {
          PrismaClient: new (args?: JsonRecord) => PrismaLikeClient;
        };

        return new module.PrismaClient();
      } catch (error) {
        console.error("Prisma client is unavailable in this environment.", error);
        return null;
      }
    })();
  }

  return prismaPromise;
}

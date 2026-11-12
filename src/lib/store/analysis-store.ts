import { AnalysisResult } from "@/lib/schemas/analysis";

type StoredAnalysis = AnalysisResult & {
  createdAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var researchMateAnalysisStore: Map<string, StoredAnalysis> | undefined;
}

const store =
  globalThis.researchMateAnalysisStore ??
  new Map<string, StoredAnalysis>([
    [
      "demo-analysis",
      {
        analysisId: "demo-analysis",
        createdAt: new Date("2026-04-25T19:30:00.000Z").toISOString(),
        query: "Agentic AI in healthcare",
        papers: [
          {
            id: "semantic_scholar-1",
            source: "SEMANTIC_SCHOLAR",
            externalId: "s2-demo-001",
            title: "Clinical agent workflows with large language models",
            authors: ["C. Scientist", "D. Analyst"],
            abstract:
              "Presents agent architectures for clinical support tasks with emphasis on tool use, validation, and bounded autonomy.",
            year: 2025,
            url: "https://www.semanticscholar.org/paper/demo",
            venue: "Semantic Scholar",
            citationCount: 14,
            doi: null,
            relevanceScore: 9.2,
            confidenceLabel: "high",
            matchedTerms: ["agentic", "healthcare", "clinical"],
            summary:
              "Focuses on how agentic LLM systems can support clinical workflows while keeping human oversight central.",
            keyContributions: [
              "Defines a healthcare-focused agent loop for evidence retrieval and reasoning.",
              "Highlights safety constraints around autonomy and clinician oversight."
            ],
            limitations: ["Longitudinal clinical validation remains limited."],
            summarySource: "live"
          },
          {
            id: "arxiv-2",
            source: "ARXIV",
            externalId: "arxiv-demo-001",
            title: "Survey of agentic AI systems in healthcare operations",
            authors: ["A. Researcher", "B. Collaborator"],
            abstract:
              "Surveys how agentic systems are being used in triage, summarization, care planning, and administrative workflows.",
            year: 2024,
            url: "https://arxiv.org/abs/2401.00001",
            venue: "arXiv",
            citationCount: null,
            doi: null,
            relevanceScore: 8.6,
            confidenceLabel: "high",
            matchedTerms: ["agentic", "healthcare"],
            summary:
              "Surveys the landscape of agentic AI systems across clinical and operational healthcare settings.",
            keyContributions: [
              "Maps current use cases and deployment constraints.",
              "Points out evaluation gaps between research claims and real-world adoption."
            ],
            limitations: ["Relies heavily on survey evidence rather than deployment results."],
            summarySource: "live"
          }
        ],
        synthesis: {
          overview:
            "Current literature clusters around clinical decision support, workflow automation, and careful limits on autonomy. Most papers focus on capability framing, while fewer provide rigorous longitudinal deployment evidence.",
          themes: [
            "Clinical reasoning support",
            "Workflow automation",
            "Human oversight",
            "Deployment evaluation"
          ],
          trends: [
            "Agentic systems are moving from pure summarization to multi-step tool use.",
            "Healthcare studies increasingly emphasize evaluation protocols and traceability.",
            "Hybrid workflows with clinicians in the loop remain the dominant deployment pattern."
          ],
          researchGaps: [
            "Limited evidence on long-term clinical outcomes after agent deployment.",
            "Inconsistent evaluation metrics across safety-critical healthcare tasks.",
            "Few benchmark datasets capture realistic multi-step healthcare workflows."
          ],
          futureDirections: [
            "Build standardized evaluation suites for agentic medical workflows.",
            "Compare bounded-autonomy designs against clinician-assisted baselines.",
            "Study reliability under changing policies, guidelines, and domain drift."
          ],
          methodologyNote:
            "Demo analysis seeded into the in-memory store so the UI has a stable first result."
        }
      }
    ]
  ]);

if (!globalThis.researchMateAnalysisStore) {
  globalThis.researchMateAnalysisStore = store;
}

export function saveAnalysis(analysis: AnalysisResult) {
  store.set(analysis.analysisId, {
    ...analysis,
    createdAt: new Date().toISOString()
  });
}

export function getAnalysisById(id: string) {
  return store.get(id) ?? null;
}

export function listAnalyses() {
  return [...store.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

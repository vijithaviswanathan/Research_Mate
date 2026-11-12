# ResearchMate

ResearchMate is an AI-powered literature discovery and synthesis app for turning a research topic into a structured literature brief.

## Planned MVP

- Accept a research topic or question
- Retrieve papers from `arXiv` and `Semantic Scholar`
- Normalize and rank results
- Generate per-paper summaries
- Synthesize themes, trends, and research gaps
- Save analyses for later review

## Current Scaffold

This repo currently includes:

- a `Next.js` app structure using the App Router
- `Prisma` schema for queries, papers, and analysis reports
- `Zod` schemas for request and response validation
- scaffold API routes under `src/app/api`
- live-ready retrieval adapters with fallback data for `arXiv` and `Semantic Scholar`
- provider-aware LLM wiring for `OpenAI`, `Ollama`, and generic OpenAI-compatible endpoints with fallback behavior
- a persistence repository that uses Prisma when configured and falls back to disk-backed storage during local setup

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `DATABASE_URL`
- `LLM_PROVIDER`
- `LLM_API_KEY`
- `LLM_MODEL`
- `LLM_BASE_URL`
- `NEBIUS_API_KEY`
- `NEBIUS_MODEL`
- `NEBIUS_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `SEMANTIC_SCHOLAR_API_KEY`

## How to run the code 

1. Clone the repository
2. Install dependencies
3. Setup Environment Varibale
4. Setup Database 'prisma' 
5. Run 'prisma' Database
6. Run the development server 

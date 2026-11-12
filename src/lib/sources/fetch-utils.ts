type JsonLike = Record<string, unknown> | Array<unknown> | string | null;

export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit & { timeoutMs?: number } = {}
) {
  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? 12000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWithRetry(
  input: string | URL,
  init: RequestInit & { timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
) {
  const retries = init.retries ?? 2;
  const retryDelayMs = init.retryDelayMs ?? 700;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, init);

      if (response.ok) {
        return response;
      }

      if (response.status < 500 && response.status !== 429) {
        return response;
      }

      lastError = new Error(`Request failed with status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown fetch failure");
}

export function isFallbackPaper(paper: { externalId?: string | null; abstract?: string | null }) {
  return (
    paper.externalId === "arxiv-demo-001" ||
    paper.externalId === "s2-demo-001" ||
    (paper.abstract ?? "").toLowerCase().includes("fallback")
  );
}

import { getOptionalEnv } from "@/lib/env";

type StructuredGenerationOptions<T> = {
  schemaName: string;
  schema: Record<string, unknown>;
  prompt: string;
  fallback: T;
};

type OpenAIResponsesApi = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

type ChatCompletionsApi = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

type ProviderConfig = {
  provider: "openai" | "ollama" | "openai_compat";
  model: string;
  apiKey: string | null;
  baseUrl: string | null;
};

function extractResponsesOutputText(payload: OpenAIResponsesApi) {
  if (payload.output_text) {
    return payload.output_text;
  }

  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" || content.type === "text")?.text;
}

function extractChatOutputText(payload: ChatCompletionsApi) {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.find((item) => item.type === "text")?.text ?? null;
  }

  return null;
}

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getProviderConfig(): ProviderConfig | null {
  const provider = (getOptionalEnv("LLM_PROVIDER") ?? "openai").toLowerCase();

  if (provider === "ollama") {
    return {
      provider: "ollama",
      model: getOptionalEnv("OLLAMA_MODEL") ?? getOptionalEnv("LLM_MODEL") ?? "llama3.2",
      apiKey: getOptionalEnv("OLLAMA_API_KEY") ?? "ollama",
      baseUrl: normalizeBaseUrl(
        getOptionalEnv("OLLAMA_BASE_URL") ?? getOptionalEnv("LLM_BASE_URL") ?? "http://127.0.0.1:11434/v1"
      )
    };
  }

  if (provider === "nebius" || provider === "nvidia" || provider === "openai_compat") {
    const baseUrl =
      provider === "nebius"
        ? getOptionalEnv("NEBIUS_BASE_URL") ??
          getOptionalEnv("LLM_BASE_URL") ??
          "https://api.tokenfactory.nebius.com/v1"
        : getOptionalEnv("LLM_BASE_URL");
    const model =
      provider === "nebius"
        ? getOptionalEnv("NEBIUS_MODEL") ?? getOptionalEnv("LLM_MODEL")
        : getOptionalEnv("LLM_MODEL");
    const apiKey =
      provider === "nebius"
        ? getOptionalEnv("NEBIUS_API_KEY") ?? getOptionalEnv("LLM_API_KEY")
        : getOptionalEnv("LLM_API_KEY");

    if (!baseUrl || !model || !apiKey) {
      return null;
    }

    return {
      provider: "openai_compat",
      model,
      apiKey,
      baseUrl: normalizeBaseUrl(baseUrl)
    };
  }

  const openAiApiKey = getOptionalEnv("OPENAI_API_KEY") ?? getOptionalEnv("LLM_API_KEY");
  if (!openAiApiKey) {
    return null;
  }

  return {
    provider: "openai",
    model: getOptionalEnv("OPENAI_MODEL") ?? getOptionalEnv("LLM_MODEL") ?? "gpt-5.2",
    apiKey: openAiApiKey,
    baseUrl: normalizeBaseUrl(getOptionalEnv("OPENAI_BASE_URL") ?? "https://api.openai.com/v1")
  };
}

async function generateWithResponsesApi<T>(
  config: ProviderConfig,
  schemaName: string,
  schema: Record<string, unknown>,
  prompt: string
) {
  const response = await fetch(`${config.baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OpenAIResponsesApi;
  const outputText = extractResponsesOutputText(payload);

  if (!outputText) {
    throw new Error("Responses API did not include output text.");
  }

  return JSON.parse(outputText) as T;
}

async function generateWithChatCompletions<T>(
  config: ProviderConfig,
  schemaName: string,
  schema: Record<string, unknown>,
  prompt: string
) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: [
            "You must return only valid JSON.",
            `The JSON must satisfy the schema named "${schemaName}".`,
            `Schema: ${JSON.stringify(schema)}`
          ].join(" ")
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ChatCompletionsApi;
  const outputText = extractChatOutputText(payload);

  if (!outputText) {
    throw new Error("Chat completions API did not include output text.");
  }

  return JSON.parse(outputText) as T;
}

export async function generateStructuredObject<T>({
  schemaName,
  schema,
  prompt,
  fallback
}: StructuredGenerationOptions<T>): Promise<T> {
  const config = getProviderConfig();

  if (!config) {
    return fallback;
  }

  try {
    if (config.provider === "openai") {
      return await generateWithResponsesApi<T>(config, schemaName, schema, prompt);
    }

    return await generateWithChatCompletions<T>(config, schemaName, schema, prompt);
  } catch {
    return fallback;
  }
}

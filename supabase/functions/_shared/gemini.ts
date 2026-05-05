// Thin wrapper over Google AI Studio's generateContent API.
// Translates an OpenAI-style request (system + role/content messages, OpenAI tool schemas,
// optional forced tool name) into Gemini's native shape, and normalizes the response back
// to { text, toolCalls } so callers can stay shape-agnostic.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type ChatMessage = { role: "user" | "assistant" | "model"; content: string };

export type OpenAITool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
};

export type GeminiResult = {
  text: string;
  toolCalls: { name: string; args: Record<string, unknown> }[];
};

export class GeminiError extends Error {
  constructor(public status: number, public body: string) {
    super(`Gemini ${status}: ${body}`);
  }
}

// Gemini's function declarations use OpenAPI schema, which doesn't support a few
// JSON Schema keywords. Strip them recursively before sending.
function stripUnsupportedKeywords(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUnsupportedKeywords);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "additionalProperties" || k === "$schema") continue;
      out[k] = stripUnsupportedKeywords(v);
    }
    return out;
  }
  return value;
}

export async function callGemini(opts: {
  apiKey: string;
  model: string;
  system?: string;
  messages: ChatMessage[];
  tools?: OpenAITool[];
  forcedTool?: string;
  generationConfig?: Record<string, unknown>;
}): Promise<GeminiResult> {
  const { apiKey, model, system, messages, tools, forcedTool, generationConfig } = opts;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" || m.role === "model" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  if (tools && tools.length > 0) {
    body.tools = [
      {
        functionDeclarations: tools.map((t) => ({
          name: t.function.name,
          description: t.function.description,
          parameters: stripUnsupportedKeywords(t.function.parameters),
        })),
      },
    ];
    if (forcedTool) {
      body.toolConfig = {
        functionCallingConfig: { mode: "ANY", allowedFunctionNames: [forcedTool] },
      };
    }
  }

  if (generationConfig) body.generationConfig = generationConfig;

  const resp = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45_000),
  });

  if (!resp.ok) {
    throw new GeminiError(resp.status, await resp.text());
  }

  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];

  let text = "";
  const toolCalls: { name: string; args: Record<string, unknown> }[] = [];
  for (const p of parts) {
    if (typeof p.text === "string") text += p.text;
    if (p.functionCall) {
      toolCalls.push({
        name: p.functionCall.name,
        args: (p.functionCall.args ?? {}) as Record<string, unknown>,
      });
    }
  }

  return { text, toolCalls };
}

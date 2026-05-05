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

/**
 * Map a Gemini failure to a client-safe Response for transient cases.
 * Returns null for unknown errors so callers fall through to their own
 * generic handler. We treat 429 (quota) and any 5xx (upstream blip,
 * including the common 503 ServiceUnavailable) as user-retryable.
 */
export function transientGeminiResponse(
  e: unknown,
  corsHeaders: Record<string, string>,
): Response | null {
  if (!(e instanceof GeminiError)) return null;
  if (e.status === 429) {
    return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (e.status >= 500 && e.status <= 599) {
    return new Response(
      JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  return null;
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

  const url = `${GEMINI_API_BASE}/${model}:generateContent`;
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  };

  // Retry once on transient upstream issues (429 quota blips and any 5xx).
  // Gemini's 503 ServiceUnavailable shows up sporadically under load and
  // almost always succeeds on the next attempt. A single 1s backoff is
  // enough to cover that without compounding edge-function latency.
  let resp: Response | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    resp = await fetch(url, { ...init, signal: AbortSignal.timeout(45_000) });
    if (resp.ok) break;
    if (attempt === 0 && (resp.status === 429 || resp.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    break;
  }

  if (!resp || !resp.ok) {
    throw new GeminiError(resp?.status ?? 0, resp ? await resp.text() : "no response");
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

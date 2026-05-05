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

export interface ErrorContext {
  requestId: string;
  fn: string; // function slug, e.g. "resume-ai"
  action?: string; // optional sub-action, e.g. "ats-score"
}

interface ErrorBody {
  error: string;
  request_id: string;
  timestamp: string;
  upstream_status?: number;
  function?: string;
  action?: string;
}

function errorBody(message: string, ctx: ErrorContext, upstreamStatus?: number): ErrorBody {
  return {
    error: message,
    request_id: ctx.requestId,
    timestamp: new Date().toISOString(),
    function: ctx.fn,
    ...(ctx.action ? { action: ctx.action } : {}),
    ...(upstreamStatus ? { upstream_status: upstreamStatus } : {}),
  };
}

/**
 * Map a Gemini failure to a client-safe Response for transient cases.
 * Returns null for unknown errors so callers fall through to their own
 * generic handler. We treat 429 (quota) and any 5xx (upstream blip,
 * including the common 503 ServiceUnavailable) as user-retryable.
 *
 * The response body now carries request_id + timestamp + upstream_status
 * so a user-reported "503 today" can be grepped against the function
 * logs without needing the dashboard request-id column.
 */
export function transientGeminiResponse(
  e: unknown,
  ctx: ErrorContext,
  corsHeaders: Record<string, string>,
): Response | null {
  if (!(e instanceof GeminiError)) return null;
  if (e.status === 429) {
    console.warn(`[${ctx.requestId}] ${ctx.fn}${ctx.action ? `:${ctx.action}` : ""} gemini 429 rate-limited`);
    return new Response(
      JSON.stringify(errorBody("Rate limited. Please try again shortly.", ctx, 429)),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (e.status >= 500 && e.status <= 599) {
    console.warn(`[${ctx.requestId}] ${ctx.fn}${ctx.action ? `:${ctx.action}` : ""} gemini ${e.status} transient; body=${e.body.slice(0, 200)}`);
    return new Response(
      JSON.stringify(errorBody("AI service temporarily unavailable. Please try again.", ctx, e.status)),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  return null;
}

/**
 * Build a sanitized error response for unknown failures. Logs the full
 * error server-side keyed by request_id, returns only the request_id +
 * timestamp + generic message to the client.
 */
export function internalErrorResponse(
  e: unknown,
  ctx: ErrorContext,
  corsHeaders: Record<string, string>,
  status = 500,
): Response {
  console.error(`[${ctx.requestId}] ${ctx.fn}${ctx.action ? `:${ctx.action}` : ""} error:`, e instanceof Error ? `${e.name}: ${e.message}` : e);
  return new Response(
    JSON.stringify(errorBody(status === 500 ? "Internal server error" : "Service unavailable", ctx)),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

export function userErrorResponse(
  message: string,
  status: number,
  ctx: ErrorContext,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify(errorBody(message, ctx)),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
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

  // Retry on transient upstream issues (429 quota blips and any 5xx).
  // Gemini's 503 ServiceUnavailable shows up sporadically under free-tier
  // load. 3 total attempts with exponential backoff (1s, 2s) covers most
  // 30-second blips while staying well under the 45s per-request timeout.
  const MAX_ATTEMPTS = 3;
  let resp: Response | undefined;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    resp = await fetch(url, { ...init, signal: AbortSignal.timeout(45_000) });
    if (resp.ok) break;
    if (attempt < MAX_ATTEMPTS - 1 && (resp.status === 429 || resp.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
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

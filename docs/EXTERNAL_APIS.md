# External (Non-Supabase) Backend APIs — profile-pros-studio

This document covers every backend API the app talks to that is **not** Supabase. Supabase Auth, PostgREST DB, and Edge Function endpoints are documented separately in [BACKEND.md](BACKEND.md).

There are two external surfaces:

1. **Google Gemini (Generative Language API)** — Google's native LLM endpoint (Gemini models). Called only from inside Supabase Edge Functions; the API key never leaves the server.
2. **Server-side URL fetch (job posting scrape)** — the `fetch-jd` Edge Function action does a server-side `fetch()` against an arbitrary user-supplied URL.

---

## 1. Google Gemini (Generative Language API)

Google's native LLM API. All AI calls in the app go directly here from the Supabase Edge Functions; there is no middleman.

- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`
- **Auth header:** `x-goog-api-key: ${GEMINI_API_KEY}`
- **`GEMINI_API_KEY`:** read from `Deno.env` inside the Edge Functions. **Never** exposed to the browser. Provisioned at <https://aistudio.google.com/apikey>.
- **Request shape:** Gemini-native — `{ systemInstruction, contents: [{role, parts}], tools, toolConfig, generationConfig }`.
- **Response shape:** Gemini-native — `data.candidates[0].content.parts[]` with each part being either `{ text }` or `{ functionCall: { name, args } }`.
- **Adapter:** [supabase/functions/_shared/gemini.ts](../supabase/functions/_shared/gemini.ts) — `callGemini()` translates an OpenAI-style request (system + role/content messages, OpenAI tool schemas, optional forced tool name) into Gemini's native shape and normalizes the response back to `{ text, toolCalls }`. Strips `additionalProperties` and `$schema` from tool schemas (Gemini's OpenAPI subset doesn't accept them).

### Models used

| Model                       | Used for                                                                    |
|-----------------------------|-----------------------------------------------------------------------------|
| `gemini-2.5-flash`          | `parse-resume`, `tailor-resume`, `ats-score`, `jd-match`, `chat`, `linkedin-review` |
| `gemini-2.5-flash-lite`     | URL → JD extraction inside `fetch-jd`                                       |

### Call sites

| Edge Function action | File / line                                                                                                | Notes                                                              |
|----------------------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| `parse-resume`       | [resume-ai/index.ts:512](../supabase/functions/resume-ai/index.ts#L512)                                    | Forced tool: `parsed_resume`                                       |
| `tailor-resume`      | [resume-ai/index.ts:512](../supabase/functions/resume-ai/index.ts#L512)                                    | Forced tool: `parsed_resume`                                       |
| `ats-score`          | [resume-ai/index.ts:512](../supabase/functions/resume-ai/index.ts#L512)                                    | Forced tool: `ats_analysis`                                        |
| `jd-match`           | [resume-ai/index.ts:512](../supabase/functions/resume-ai/index.ts#L512)                                    | Forced tool: `jd_match_analysis`                                   |
| `chat`               | [resume-ai/index.ts:440](../supabase/functions/resume-ai/index.ts#L440)                                    | `chatTools` available, no forced tool choice                       |
| `fetch-jd` (extract) | [resume-ai/index.ts:254](../supabase/functions/resume-ai/index.ts#L254)                                    | No tools — plain text completion to clean up scraped HTML          |
| `linkedin-review`    | [linkedin-review/index.ts:44](../supabase/functions/linkedin-review/index.ts#L44)                          | Forced tool: `linkedin_review`                                     |

### Example request

```ts
// In Edge Functions, prefer the helper:
import { callGemini } from "../_shared/gemini.ts";
const { text, toolCalls } = await callGemini({
  apiKey: GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  system: systemPrompt,
  messages: [{ role: "user", content: userPrompt }],
  tools: chatTools,
  forcedTool: "parsed_resume", // optional
});

// Or direct:
await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
  body: JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    tools: [{ functionDeclarations: [/* ... */] }],
    toolConfig: { functionCallingConfig: { mode: "ANY", allowedFunctionNames: ["parsed_resume"] } },
  }),
});
```

### Error mapping

The Edge Functions translate Gemini errors into the responses the client sees:

| Upstream status | Client response                                                |
|-----------------|----------------------------------------------------------------|
| `429`           | `{ error: "Rate limited. Please try again shortly." }` (429)   |
| any other       | `{ error: "AI gateway error" }` (500)                          |

### Tool / function schemas

The gateway is asked to produce structured output via OpenAI tool calling. Schemas are declared in the Edge Function code:

- `parsed_resume` — full `ResumeData` shape ([resume-ai/index.ts:9-110](../supabase/functions/resume-ai/index.ts#L9-L110)).
- `ats_analysis` — `{ overallScore, categories[], topStrengths[], criticalIssues[], quickWins[] }` ([resume-ai/index.ts:320-348](../supabase/functions/resume-ai/index.ts#L320-L348)).
- `jd_match_analysis` — `{ matchScore, matchedKeywords[], missingKeywords[], experienceMatch, skillsGap[], recommendations[], sectionFeedback[] }` ([resume-ai/index.ts:355-382](../supabase/functions/resume-ai/index.ts#L355-L382)).
- `chatTools` — `update_section`, `reorder_sections`, `toggle_section`, `add_item`, `remove_item` ([resume-ai/index.ts:113-220](../supabase/functions/resume-ai/index.ts#L113-L220)).
- `linkedin_review` — `{ overallScore, projectedOverallScore, summary, profileName, profileHeadline, sections[], topStrengths[], criticalImprovements[] }` ([linkedin-review/index.ts:62-90](../supabase/functions/linkedin-review/index.ts#L62-L90)).

---

## 2. Server-side URL fetch (job posting scrape)

Inside the `fetch-jd` action of the `resume-ai` Edge Function ([resume-ai/index.ts:241-251](../supabase/functions/resume-ai/index.ts#L241-L251)), the server fetches an arbitrary URL supplied by the user and extracts JD text.

### Outbound request

```ts
fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; Jobiffy/1.0)" },
});
```

- **Target:** any URL the user pastes in the JD Matcher panel.
- **Triggered by:** [JDMatchPanel.tsx:48](../src/components/resume/JDMatchPanel.tsx#L48) → `supabase.functions.invoke("resume-ai", { body: { action: "fetch-jd", url } })`.
- **Post-processing (server-side):**
  1. Strip `<script>` and `<style>` blocks.
  2. Strip remaining HTML tags.
  3. Collapse whitespace, slice to 15 000 chars.
  4. Send to Google Gemini (Generative Language API) with `google/gemini-2.5-flash-lite` to extract just the JD text.
- **Response to client:** `{ jobDescription: string }`.

### Errors

| Cause                                  | Client sees                              |
|----------------------------------------|------------------------------------------|
| URL missing                            | 500 `{ error: "URL is required" }`       |
| `fetch(url)` non-2xx                   | 500 `{ error: "Failed to fetch URL: <status>" }` |
| Downstream gateway error               | 500 `{ error: "Failed to extract job description" }` |

### Security note

This is a server-side fetch of attacker-controlled URLs — a minor **SSRF** surface. If Supabase's edge runtime can route to internal addresses or cloud metadata IPs, a user could probe them. Mitigations to consider: blocklist RFC1918 / link-local / cloud metadata (`169.254.169.254`), require `https://`, cap response size before reading, set a tight timeout.

---

## 3. Summary

| External service             | Where it's called from                  | Auth                                | Data sent                                  | Data returned                                |
|------------------------------|-----------------------------------------|-------------------------------------|--------------------------------------------|----------------------------------------------|
| Google Gemini (Generative Language API)           | Supabase Edge Functions (server-side)   | `Bearer ${GEMINI_API_KEY}` (server)| Resume data, JD text, profile text, prompts| LLM completion + structured tool-call JSON   |
| Arbitrary JD URLs (`fetch-jd`)| Supabase Edge Function (server-side)   | None (anonymous GET)                | Plain HTTP GET with custom UA              | HTML, then sliced/cleaned and AI-extracted   |

> Everything else — DB reads/writes, auth session, user accounts, credit ledger, Edge Functions — is Supabase. See [BACKEND.md](BACKEND.md).

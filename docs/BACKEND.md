# Backend Documentation - profile-pros-studio

This document covers the database schema, data storage locations, and every backend API used by the app.

The app uses **Supabase** as its sole backend (Postgres + Auth + Edge Functions). The two Supabase Edge Functions call **Google Gemini directly** (Generative Language API at `generativelanguage.googleapis.com`) for all AI features.

- Project ref: `hyorirvoionrcahoqyhq` ([supabase/config.toml](../supabase/config.toml))
- Client config: [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts)
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 1. Database Schema

Defined in [supabase/migrations/20260317182125_d8a0e5ee-16de-4795-8fd6-10d726dd2f3d.sql](../supabase/migrations/20260317182125_d8a0e5ee-16de-4795-8fd6-10d726dd2f3d.sql) and mirrored as TS types in [src/integrations/supabase/types.ts](../src/integrations/supabase/types.ts).

### `auth.users`
Managed by Supabase Auth. Not declared in app migrations; referenced as a foreign key.

### `public.user_credits`
One row per user; tracks the current credit balance.

| Column       | Type        | Notes                                                   |
|--------------|-------------|---------------------------------------------------------|
| `id`         | UUID PK     | `gen_random_uuid()`                                     |
| `user_id`    | UUID        | FK → `auth.users(id)` ON DELETE CASCADE, **UNIQUE**     |
| `balance`    | INTEGER     | NOT NULL, default `50`                                  |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()`                               |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `now()` (auto-bumped via trigger)     |

**RLS** (enabled): users can `SELECT`, `INSERT`, `UPDATE` only their own row (`auth.uid() = user_id`).

### `public.credit_transactions`
Append-only ledger of every credit change.

| Column        | Type        | Notes                                                                              |
|---------------|-------------|------------------------------------------------------------------------------------|
| `id`          | UUID PK     | `gen_random_uuid()`                                                                |
| `user_id`     | UUID        | FK → `auth.users(id)` ON DELETE CASCADE                                            |
| `amount`      | INTEGER     | NOT NULL (negative for deductions)                                                 |
| `type`        | TEXT        | NOT NULL, CHECK `IN ('topup', 'deduction', 'bonus')`                               |
| `description` | TEXT        | nullable                                                                           |
| `feature`     | TEXT        | nullable, CHECK `IN ('ai_chat', 'jd_match', 'ats_check', 'topup', 'signup_bonus')` |
| `created_at`  | TIMESTAMPTZ | NOT NULL, default `now()`                                                          |

**RLS** (enabled): users can `SELECT` and `INSERT` only their own rows.

### Triggers / Functions

- `update_updated_at_column()` - sets `NEW.updated_at = now()` on UPDATE.
- Trigger `update_user_credits_updated_at` on `BEFORE UPDATE OF user_credits`.
- `handle_new_user_credits()` (`SECURITY DEFINER`) - on `auth.users INSERT`, seeds a 50-credit row in `user_credits` plus a `signup_bonus` row in `credit_transactions`.
- Trigger `on_auth_user_created_credits` on `AFTER INSERT ON auth.users`.

---

## 2. Data Storage Locations

### Supabase (Postgres) - server side
- `auth.users` - accounts (managed by Supabase Auth).
- `public.user_credits` - balances.
- `public.credit_transactions` - credit ledger.

### Browser `localStorage` - per-device
Resume content is **not** in Supabase; it lives in the browser. Defined in [src/hooks/useResumeStore.ts](../src/hooks/useResumeStore.ts).

| Key                      | Contents                                                                                                                                                  |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jobiffy-resumes`        | JSON array of `SavedResume` - `{ id, name, data: ResumeData, chatMessages, createdAt, updatedAt }`. `ResumeData` shape is in [src/types/resume.ts](../src/types/resume.ts). |
| `jobiffy-active-resume`  | Id of the currently selected resume.                                                                                                                      |
| `jobiffy-theme`          | `"dark"` \| `"light"` ([src/pages/ResumeBuilder.tsx](../src/pages/ResumeBuilder.tsx)).                                                                     |
| `jobiffy-onboarded`      | `"true"` once the onboarding tour is dismissed.                                                                                                           |
| Supabase auth session    | JWT/refresh tokens written by `@supabase/supabase-js` because [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts) sets `storage: localStorage, persistSession: true`. |

> Implication: resumes are **device-local**. A user signing in on a different browser sees only their credit balance - not their saved resumes.

---

## 3. Auth APIs (Supabase Auth)

| Method                                                                                  | Where                                                                                                                                                | Purpose                                       |
|-----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `supabase.auth.signInWithOtp({ email, options.emailRedirectTo })`                       | [Auth.tsx:39](../src/pages/Auth.tsx#L39)                                                                                                             | Email magic-link sign-in                      |
| `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`        | [Auth.tsx:25](../src/pages/Auth.tsx#L25)                                                                                                             | Google OAuth (native Supabase)                |
| `supabase.auth.onAuthStateChange(cb)`                                                   | [AuthContext.tsx:27](../src/contexts/AuthContext.tsx#L27)                                                                                            | Subscribe to login/logout                     |
| `supabase.auth.getSession()`                                                            | [AuthContext.tsx:33](../src/contexts/AuthContext.tsx#L33)                                                                                            | Hydrate session on app load                   |
| `supabase.auth.signOut()`                                                               | [AuthContext.tsx:43](../src/contexts/AuthContext.tsx#L43)                                                                                            | Sign out                                      |

---

## 4. Database APIs (PostgREST via supabase-js)

All under `https://<project>.supabase.co/rest/v1/`. RLS-gated to the authenticated user. All calls live in [src/hooks/useCredits.ts](../src/hooks/useCredits.ts).

### `GET user_credits` - fetch balance
```ts
supabase.from("user_credits").select("balance").eq("user_id", user.id).maybeSingle()
```
Returns `{ balance: number } | null`.

### `INSERT user_credits` - backfill row for an existing user missing one
```ts
supabase.from("user_credits").insert({ user_id, balance: 50 })
```
Normally the `on_auth_user_created_credits` trigger handles signup; this is the backfill path.

### `UPDATE user_credits` - change balance
```ts
supabase.from("user_credits").update({ balance: newBalance }).eq("user_id", user.id)
```
The `update_user_credits_updated_at` trigger bumps `updated_at` automatically.

### `GET credit_transactions` - list recent transactions
```ts
supabase.from("credit_transactions")
  .select("*").eq("user_id", user.id)
  .order("created_at", { ascending: false }).limit(50)
```

### `INSERT credit_transactions` - append ledger entry
```ts
supabase.from("credit_transactions").insert({
  user_id, amount, type: "topup" | "deduction" | "bonus",
  description, feature: "ai_chat" | "jd_match" | "ats_check" | "topup" | "signup_bonus"
})
```

### Credit cost table (client-enforced)
[useCredits.ts:15-19](../src/hooks/useCredits.ts#L15-L19):

| Feature      | Cost |
|--------------|------|
| `ai_chat`    | 2    |
| `jd_match`   | 3    |
| `ats_check`  | 3    |

> Deduction is **not atomic** - read balance, check, write new balance. Two concurrent feature uses could race. Server-side enforcement would require a Postgres function or RLS-level check.

---

## 5. Edge Function: `resume-ai`

- **Endpoint:** `POST https://<project>.supabase.co/functions/v1/resume-ai`
- **Auth:** `verify_jwt = false` ([supabase/config.toml](../supabase/config.toml)) - public, but supabase-js still attaches the user JWT.
- **Source:** [supabase/functions/resume-ai/index.ts](../supabase/functions/resume-ai/index.ts)
- **Invoked via:** `supabase.functions.invoke("resume-ai", { body: {...} })`

Multiplexed by the `action` field. Six actions:

### 5.1 `action: "parse-resume"`
Extract structured `ResumeData` from raw resume text (uploaded `.docx`/`.pdf`, parsed client-side via mammoth/pdf libs).

- **Body:** `{ action: "parse-resume", rawText: string }`
- **Caller:** [ResumeImport.tsx:85](../src/components/resume/ResumeImport.tsx#L85)
- **Model:** `google/gemini-3-flash-preview` (forced tool call: `parsed_resume`)
- **Returns:** `ResumeData` JSON - `header`, `summary`, `experience[]`, `education[]`, `skills[]`, `projects[]`, `certifications[]`, `leadership[]`, `customSections[]`. Schema: [resume-ai/index.ts:9-110](../supabase/functions/resume-ai/index.ts#L9-L110).
- **Errors:** 500 if `rawText` missing.

### 5.2 `action: "tailor-resume"`
Rewrite a resume to match a target job description.

- **Body:** `{ action: "tailor-resume", resumeData: ResumeData, jobDescription: string }`
- **Caller:** [useResumeAI.ts:79](../src/hooks/useResumeAI.ts#L79) (`tailorResume`)
- **Model:** `google/gemini-3-flash-preview` (forced tool call: `parsed_resume`)
- **Returns:** new `ResumeData`.

### 5.3 `action: "ats-score"`
Score the resume on ATS compatibility.

- **Body:** `{ action: "ats-score", resumeData: ResumeData }`
- **Caller:** [useResumeAI.ts:49](../src/hooks/useResumeAI.ts#L49) (`analyzeATS`)
- **Model:** `google/gemini-3-flash-preview` (forced tool call: `ats_analysis`)
- **Returns:** `ATSResult` - `{ overallScore, categories: [{ name, score, feedback, suggestions[] }], topStrengths[], criticalIssues[], quickWins[] }`. Defined in [useResumeAI.ts:6-12](../src/hooks/useResumeAI.ts#L6-L12).
- **Credits:** 3 (`ats_check`).

### 5.4 `action: "jd-match"`
Compare resume vs JD.

- **Body:** `{ action: "jd-match", resumeData: ResumeData, jobDescription: string }`
- **Caller:** [useResumeAI.ts:64](../src/hooks/useResumeAI.ts#L64) (`matchJD`)
- **Model:** `google/gemini-3-flash-preview` (forced tool call: `jd_match_analysis`)
- **Returns:** `JDMatchResult` - `{ matchScore, matchedKeywords[], missingKeywords[], experienceMatch, skillsGap[], recommendations[], sectionFeedback: [{ section, score, feedback }] }`. Defined in [useResumeAI.ts:14-22](../src/hooks/useResumeAI.ts#L14-L22).
- **Credits:** 3 (`jd_match`).

### 5.5 `action: "fetch-jd"`
Server-side scrape of a job posting URL → extract clean JD text.

- **Body:** `{ action: "fetch-jd", url: string }`
- **Caller:** [JDMatchPanel.tsx:48](../src/components/resume/JDMatchPanel.tsx#L48)
- **Flow:** server `fetch(url)` with browser User-Agent → strip `<script>`/`<style>`/tags → cap at 15 000 chars → send to AI for extraction.
- **Model:** `google/gemini-2.5-flash-lite` (no tools)
- **Returns:** `{ jobDescription: string }`
- **Errors:** 500 if URL missing or page fetch fails.

### 5.6 `action: "chat"`
Conversational resume coach. Returns text + tool calls the client applies to mutate the resume.

- **Body:** `{ action: "chat", resumeData: ResumeData, messages: { role, content }[] }`
- **Caller:** [useResumeAI.ts:116](../src/hooks/useResumeAI.ts#L116) (`sendChatMessage`)
- **Model:** `google/gemini-2.5-flash`, with `chatTools`, no forced tool choice
- **Returns:** `{ content: string, tool_calls: { id, name, arguments }[] }`
- **Tools the AI can call** ([resume-ai/index.ts:113-220](../supabase/functions/resume-ai/index.ts#L113-L220)):
  - `update_section({ field, value, change_type: "grammar" | "content" | "keyword" | "formatting" })` - dot-path field update (e.g. `experience[0].bullets`).
  - `reorder_sections({ section_order: string[] })`
  - `toggle_section({ section_id, visible })`
  - `add_item({ section, item })` - `section` ∈ `experience` / `education` / `skills` / `projects` / `certifications` / `leadership`.
  - `remove_item({ section, index })`
- The client executes each tool call by calling local handlers wired in [useResumeAI.ts:131-176](../src/hooks/useResumeAI.ts#L131-L176).
- **Credits:** 2 (`ai_chat`).

### Common error responses (resume-ai)

| Status | Body                                                       | Meaning                              |
|--------|------------------------------------------------------------|--------------------------------------|
| 429    | `{ error: "Rate limited. Please try again shortly." }`     | Gemini quota / per-minute limit hit  |
| 500    | `{ error: "<message>" }`                                   | Bad input / config / unknown action  |

---

## 6. Edge Function: `linkedin-review`

- **Endpoint:** `POST https://<project>.supabase.co/functions/v1/linkedin-review`
- **Auth:** `verify_jwt = false` ([supabase/config.toml](../supabase/config.toml))
- **Source:** [supabase/functions/linkedin-review/index.ts](../supabase/functions/linkedin-review/index.ts)
- **Caller:** [LinkedInReviewer.tsx:173](../src/pages/LinkedInReviewer.tsx#L173)
- **Body:** `{ linkedinUrl?: string, profileText: string /* >=50 chars */ }`
- **Model:** `google/gemini-3-flash-preview` (forced tool call: `linkedin_review`)
- **Returns:** `{ overallScore, projectedOverallScore, summary, profileName, profileHeadline, sections: [{ name, score, projectedScore, issues[], suggestions[] }], topStrengths[], criticalImprovements[] }` - schema in [linkedin-review/index.ts:62-90](../supabase/functions/linkedin-review/index.ts#L62-L90).
- **Errors:**

| Status | Cause                                            |
|--------|--------------------------------------------------|
| 400    | `profileText` < 50 chars                         |
| 429    | Gemini quota / rate limit                        |
| 500    | Parse failure or missing `GEMINI_API_KEY`        |

> Not gated on credits client-side - free per request today.

---

## 7. Upstream third-party API (called only from Edge Functions)

### Google Gemini (Generative Language API)
- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`
- **Auth:** `x-goog-api-key: ${GEMINI_API_KEY}` (function env var, never sent to browser).
- **Shape:** OpenAI-compatible `chat/completions` with `tools` + `tool_choice`.
- **Models used:**
  - `google/gemini-3-flash-preview` - parse, tailor, ats, jd, linkedin
  - `google/gemini-2.5-flash` - chat
  - `google/gemini-2.5-flash-lite` - URL → JD extraction
- The function maps upstream `429` → `429`, `402` → `402` to the client.

---

## 8. End-to-End Call Map

| User feature                  | Frontend caller                                                                                                      | Edge Fn / DB                                              | Cost           |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|----------------|
| Sign in (magic link)          | [Auth.tsx:39](../src/pages/Auth.tsx#L39)                                                                             | `supabase.auth.signInWithOtp`                             | -              |
| Sign in (Google)              | [Auth.tsx:25](../src/pages/Auth.tsx#L25)                                                                             | `supabase.auth.signInWithOAuth({ provider: "google" })`   | -              |
| Show credit balance + history | [useCredits.ts](../src/hooks/useCredits.ts)                                                                          | `user_credits` SELECT, `credit_transactions` SELECT       | -              |
| Import resume from .docx/.pdf | [ResumeImport.tsx:85](../src/components/resume/ResumeImport.tsx#L85)                                                 | `resume-ai` action `parse-resume`                         | free           |
| Fetch JD from a URL           | [JDMatchPanel.tsx:48](../src/components/resume/JDMatchPanel.tsx#L48)                                                 | `resume-ai` action `fetch-jd`                             | free           |
| Match resume vs JD            | [useResumeAI.ts:64](../src/hooks/useResumeAI.ts#L64)                                                                 | `resume-ai` action `jd-match` + 2 ledger writes           | 3 credits      |
| Tailor resume to JD           | [useResumeAI.ts:79](../src/hooks/useResumeAI.ts#L79)                                                                 | `resume-ai` action `tailor-resume`                        | not deducted   |
| ATS score                     | [useResumeAI.ts:49](../src/hooks/useResumeAI.ts#L49)                                                                 | `resume-ai` action `ats-score`                            | 3 credits      |
| AI chat                       | [useResumeAI.ts:116](../src/hooks/useResumeAI.ts#L116)                                                               | `resume-ai` action `chat`                                 | 2 credits      |
| LinkedIn review               | [LinkedInReviewer.tsx:173](../src/pages/LinkedInReviewer.tsx#L173)                                                   | `linkedin-review`                                         | free           |

---

## 9. Notes & Caveats

- **`verify_jwt = false`** on both edge functions - anyone with the URL can call them and burn `GEMINI_API_KEY` budget. There is no server-side credit check; deduction is purely client-side in `useCredits.ts`. A determined user can bypass by calling the function directly. To gate, flip `verify_jwt = true` and check `auth.uid()` + decrement credits inside the function.
- **`tailorResume` is not wired to `deductCredits`** - the other AI features deduct, this one doesn't (no `tailor` value in the `feature` CHECK constraint either; would need a migration to add it).
- **Credit deduction is non-atomic** ([useCredits.ts:65-95](../src/hooks/useCredits.ts#L65-L95)) - read-then-write. Consider a Postgres `RPC` like `deduct_credits(feature, cost)` doing the check + update + ledger insert in one transaction.
- **`fetch-jd`** does a server-side fetch of arbitrary user-supplied URLs - minor SSRF surface (could probe internal addresses if Supabase's edge runtime allows it). Worth blocklisting RFC1918 / metadata IPs if this matters.

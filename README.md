# Jobiffy — Profile Pros Studio

AI-powered resume builder, ATS scorer, JD matcher, and LinkedIn profile reviewer.

## Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase (Auth + Postgres + Edge Functions)

## Local development

```sh
# Install dependencies
npm install

# Start the dev server (http://localhost:8080)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment

Create a `.env` in the project root:

```ini
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-publishable-anon-key>"
VITE_SUPABASE_PROJECT_ID="<your-project-ref>"
```

## Documentation

- [docs/BACKEND.md](docs/BACKEND.md) — database schema, Supabase APIs, Edge Functions
- [docs/EXTERNAL_APIS.md](docs/EXTERNAL_APIS.md) — non-Supabase backend surfaces

## Project structure

- `src/` — React app
- `supabase/migrations/` — Postgres schema
- `supabase/functions/` — Deno-based Edge Functions (`resume-ai`, `linkedin-review`)

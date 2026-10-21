# NoteGenie

NoteGenie turns study material into structured study notes. Paste text or upload a text-based PDF to generate a summary, key points, and a multiple-choice quiz. You can also ask questions grounded in saved notes using retrieval-augmented generation (RAG).

## Live app

- **Website:** [note-genie-flame.vercel.app](https://note-genie-flame.vercel.app/)
- **API health:** [notegenie-m060.onrender.com/health](https://notegenie-m060.onrender.com/health)

The API is hosted on Render, the Next.js website is hosted on Vercel, and note data and embeddings are stored in Supabase Postgres with `pgvector`.

## Features

- Generate a study summary, key points, and a five-question multiple-choice quiz.
- Upload a PDF up to 10 MB and extract selectable text. Scanned PDFs need OCR before upload.
- Save notes and split source material into chunks for retrieval.
- Create 768-dimensional Gemini embeddings and store them with Supabase `pgvector`.
- Ask questions using the most relevant saved text chunks as context.
- Browse saved notes and select one to view its generated material.

## Technology

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **API:** Node.js, Express 5, TypeScript
- **AI:** Google Gemini for generation and embeddings
- **Database and vectors:** Supabase Postgres, `pg`, and `pgvector`
- **PDF extraction:** `pdf-parse`
- **Hosting:** Vercel (web) and Render (API)

## Repository layout

```text
apps/
  api/   Express API
  web/   Next.js website
```

## Run locally

### Requirements

- Node.js and npm
- A Supabase project with the schema below
- A Google Gemini API key

### 1. Configure Supabase

In the Supabase SQL Editor, enable `pgvector` and create the tables used by the API:

```sql
create extension if not exists vector with schema extensions;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_text text not null,
  summary text not null,
  key_points jsonb not null default '[]'::jsonb,
  quiz jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.note_chunks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(768) not null,
  created_at timestamptz not null default now(),
  unique (note_id, chunk_index)
);

alter table public.notes enable row level security;
alter table public.note_chunks enable row level security;
```

The API connects directly to Postgres. Keep its database connection string on the API server; never expose it in the website or commit it to Git.

### 2. Configure the API

From the repository root, run these commands in PowerShell:

```powershell
Set-Location .\apps\api
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Set the values in `apps/api/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=4000
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=your_supabase_postgres_connection_string
```

Use a Supabase connection string with SSL enabled. Do not commit `.env` or share its values. The checked-in `.env.example` contains placeholders only.

Install dependencies and start the API:

```powershell
npm install
npm run dev
```

The API runs at `http://localhost:4000`. Keep this terminal open while developing locally.

### 3. Configure and start the website

Open a second PowerShell window at the repository root and run:

```powershell
Set-Location .\apps\web
npm install
$env:NEXT_PUBLIC_API_URL = "http://localhost:4000"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep this second terminal open too. The website defaults to `http://localhost:4000` if `NEXT_PUBLIC_API_URL` is not set.

## API routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/health` | API status |
| `GET` | `/health/db` | Database connectivity status |
| `GET` | `/api/notes` | List saved notes |
| `POST` | `/api/generate` | Generate and save notes from text |
| `POST` | `/api/upload-pdf` | Extract text from a PDF, then generate and save notes; multipart field: `file` |
| `POST` | `/api/ask` | Answer a question using retrieved saved-note chunks |

## Deployment

The deployed app uses these services:

- **Website:** Vercel, rooted at `apps/web`
- **API:** Render Web Service, rooted at `apps/api`
- **Database:** Supabase Postgres

### Vercel environment variable

Set this variable for the Vercel **Production** environment:

```text
NEXT_PUBLIC_API_URL=https://notegenie-m060.onrender.com
```

### Render environment variables

Set these in the Render API service's Environment settings:

```text
GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-3.5-flash-lite
DATABASE_URL=<your Supabase Postgres connection string>
WEB_ORIGIN=https://note-genie-flame.vercel.app
```

Render provides `PORT` at runtime; do not hardcode a production port. The API's build command is `npm install && npm run build` and its start command is `npm start`.

The Render free instance may spin down after inactivity, so its first request after a quiet period can take longer. Pushing changes to the connected GitHub branch triggers new deployments.

## Security and limitations

- The current app has no user accounts or per-user access controls. Saved notes are shared in the deployed app; do not use it for confidential or sensitive study material.
- Keep Gemini and database credentials in Render's environment settings, never in frontend variables, source files, or GitHub.
- PDF uploads are limited to 10 MB and require selectable text. Scanned PDFs need OCR first.
- Gemini API usage is subject to the account's model availability, rate limits, and quota.

## License

No license has been added yet. All rights are reserved unless a license is added to this repository.

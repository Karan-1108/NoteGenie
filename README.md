\# NoteGenie



NoteGenie turns study material into summaries, key points, and quizzes. You can paste text or upload a text-based PDF, then ask questions about saved notes using retrieval-augmented generation (RAG).



\## Features



\- Generate a summary, key points, and a five-question multiple-choice quiz.

\- Upload a PDF up to 10 MB and extract its selectable text.

\- Save notes and their text chunks in Supabase Postgres.

\- Create Gemini embeddings and store them with the `pgvector` extension.

\- Ask questions grounded in the saved study material.



Scanned PDFs require OCR before upload. User accounts and per-user note privacy have not been implemented yet.



\## Tech stack



\- Frontend: Next.js, React, TypeScript, Tailwind CSS

\- API: Express, TypeScript, Multer, `pdf-parse`

\- AI: Google Gemini for note generation, embeddings, and answers

\- Database: Supabase Postgres with `pgvector`



\## Project structure



```text

apps/

&#x20; api/    Express API

&#x20; web/    Next.js frontend

```



\## Requirements



\- Node.js and npm

\- A Supabase project with the `vector` extension and the `notes` and `note\_chunks` tables

\- A Google Gemini API key



\## Run locally



\### 1. Configure the API



In PowerShell:



```powershell

cd C:\\Users\\KARAN\\NoteGenie\\apps\\api

Copy-Item .env.example .env

```



Put your own values in `apps/api/.env`:



```env

GEMINI\_API\_KEY=your\_gemini\_api\_key

GEMINI\_MODEL=gemini-3.5-flash-lite

PORT=4000

WEB\_ORIGIN=http://localhost:3000

DATABASE\_URL=your\_supabase\_postgres\_connection\_string

```



Never commit `.env` or share its contents. Use your Supabase session-pooler connection string for `DATABASE\_URL`, including the required SSL options.



\### 2. Start the API



```powershell

cd C:\\Users\\KARAN\\NoteGenie\\apps\\api

npm install

npm run dev

```



The API runs at `http://localhost:4000`.



\### 3. Start the website



Open a second PowerShell window:



```powershell

cd C:\\Users\\KARAN\\NoteGenie\\apps\\web

npm install

npm run dev

```



Open `http://localhost:3000`.



\## API endpoints



\- `GET /health` — API status

\- `GET /health/db` — database connection status

\- `POST /api/generate` — generate and save notes from text

\- `POST /api/upload-pdf` — extract PDF text, then generate and save notes

\- `GET /api/notes` — list saved notes

\- `POST /api/ask` — ask a question about saved notes



\## Database



The API expects these tables in the Supabase `public` schema:



\- `notes`: generated title, source text, summary, key points, quiz, and creation time

\- `note\_chunks`: text chunks and their vector embeddings, linked to `notes`



Enable the `vector` extension in Supabase before creating the `note\_chunks` table. Keep database credentials on the API server; do not put them in frontend environment variables.



\## Deployment status



This project is currently configured for local development. Deployment, authentication, and per-user access controls are future work.


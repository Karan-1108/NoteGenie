# NoteGenie - AI Study Notes & Quiz Generator

NoteGenie is an intelligent study assistant that transforms raw notes or documents into structured learning materials. It uses Large Language Models (LLMs) and a Retrieval-Augmented Generation (RAG) pipeline to generate summaries, key points, quizzes, and answer specific questions based on the provided context.

## 🚀 Live Demo
* **Live App:** [https://notegenie-yourname.vercel.app](https://notegenie-yourname.vercel.app) *(Replace with your actual link)*

## ✨ Features
* **Smart Summarization:** Paste text or upload notes to get concise summaries and key points.
* **Auto-Generated Quizzes:** Generates 5-question multiple-choice quizzes to test your knowledge.
* **Context-Aware Q&A (RAG):** Ask questions directly about your notes. The app uses vector similarity search to find relevant chunks and grounds the LLM's answer in your actual text.
* **User Dashboard:** Save, organize, and revisit your generated study materials.
* **Streaming Responses:** LLM responses are streamed to the UI for a fast, interactive experience.

## 🛠️ Tech Stack
* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Backend:** Node.js, Express.js / Next.js API Routes
* **AI & LLM:** OpenAI API (GPT-4o-mini) / Google Gemini API
* **Embeddings & Vector DB:** OpenAI `text-embedding-3-small`, Pinecone / Supabase `pgvector`
* **Database:** PostgreSQL (for user data and note metadata)

## 🧠 How the RAG Pipeline Works
1. **Chunking:** User text is split into smaller, overlapping chunks.
2. **Embedding:** Each chunk is converted into a vector embedding using the LLM API.
3. **Storage:** Vectors are stored in the Vector Database.
4. **Retrieval:** When a user asks a question, the question is embedded, and a similarity search retrieves the top relevant chunks.
5. **Generation:** The retrieved chunks and the user's question are sent to the LLM to generate a context-grounded answer.

## ⚙️ Local Setup
1. Clone the repository
   `git clone https://github.com/Karan-1108/NoteGenie.git`
2. Install dependencies
   `npm install`
3. Set up `.env` file with your `OPENAI_API_KEY` (or `GEMINI_API_KEY`), `DATABASE_URL`, and `PINECONE_API_KEY`.
4. Start the development server
   `npm run dev`

## 📸 Screenshots
*(Add 1-2 screenshots of the quiz generation and the chat interface here)*

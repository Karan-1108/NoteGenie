"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

type Note = {
  id?: string;
  title?: string;
  summary: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
  createdAt?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const MAX_PDF_SIZE = 10 * 1024 * 1024;

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Note | null>(null);
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const [savedNotesError, setSavedNotesError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

  const loadSavedNotes = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/notes`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load saved notes.");
    }

    setSavedNotes(Array.isArray(data.notes) ? data.notes : []);
    setSavedNotesError("");
  }, []);

  useEffect(() => {
    loadSavedNotes().catch(() => {
      setSavedNotesError("Could not load saved notes. Is the API running?");
    });
  }, [loadSavedNotes]);

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAskError("");
    setAnswer("");
    setSources([]);

    if (question.trim().length < 3) {
      setAskError("Enter a question with at least 3 characters.");
      return;
    }

    setAsking(true);

    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not answer the question.");
      }

      setAnswer(data.answer);
      setSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (err) {
      setAskError(
        err instanceof Error ? err.message : "Could not answer the question.",
      );
    } finally {
      setAsking(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (text.trim().length < 30) {
      setError("Paste at least 30 characters of study material.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate notes.");
      }

      setResult(data as Note);

      try {
        await loadSavedNotes();
      } catch {
        setSavedNotesError(
          "The note was generated, but the saved-notes list could not refresh.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Check that both servers are running.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePdfUpload() {
    setPdfError("");
    setError("");
    setResult(null);

    if (!pdfFile) {
      setPdfError("Choose a PDF file first.");
      return;
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      setPdfError("The PDF must be 10 MB or smaller.");
      return;
    }

    setUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch(`${API_URL}/api/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not upload the PDF.");
      }

      setResult(data as Note);
      setPdfFile(null);

      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }

      try {
        await loadSavedNotes();
      } catch {
        setSavedNotesError(
          "The note was created, but the saved-notes list could not refresh.",
        );
      }
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Could not upload the PDF.",
      );
    } finally {
      setUploadingPdf(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Your AI study companion
          </p>
          <h1 className="text-4xl font-bold tracking-tight">NoteGenie</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Turn your study material into a clear summary, key points, and a
            quick quiz.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Saved notes</h2>
            <button
              type="button"
              onClick={() =>
                loadSavedNotes().catch(() =>
                  setSavedNotesError("Could not load saved notes."),
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {savedNotesError && (
            <p className="mb-3 text-sm text-red-700">{savedNotesError}</p>
          )}

          {savedNotes.length === 0 ? (
            <p className="text-sm text-slate-600">
              No saved notes yet. Generate notes and they’ll appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {savedNotes.map((note, index) => (
                <li key={note.id ?? index}>
                  <button
                    type="button"
                    onClick={() => setResult(note)}
                    className="w-full rounded-xl bg-slate-50 p-4 text-left hover:bg-indigo-50"
                  >
                    <span className="block font-semibold">
                      {note.title || "Untitled notes"}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Ask your saved notes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Answers are based on the study material you’ve saved.
          </p>

          <form onSubmit={handleAsk} className="mt-4 flex flex-col gap-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question about your notes..."
              maxLength={1000}
              rows={3}
              className="w-full rounded-xl border border-slate-300 p-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              disabled={asking}
              className="self-end rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {asking ? "Searching notes..." : "Ask"}
            </button>
          </form>

          {askError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {askError}
            </p>
          )}

          {answer && (
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold">Answer</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {answer}
              </p>
              {sources.length > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  Sources: {sources.join(", ")}
                </p>
              )}
            </div>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label
            htmlFor="study-material"
            className="mb-3 block text-sm font-semibold"
          >
            Paste your study material
          </label>

          <textarea
            id="study-material"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste notes, textbook excerpts, or lecture material here..."
            maxLength={40000}
            rows={10}
            className="w-full resize-y rounded-xl border border-slate-300 p-4 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-slate-500">
              {text.length.toLocaleString()} / 40,000 characters
            </span>
            <button
              type="submit"
              disabled={loading || uploadingPdf}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate study notes"}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="my-6 border-t border-slate-200" />

          <label
            htmlFor="pdf-file"
            className="mb-2 block text-sm font-semibold"
          >
            Or upload a PDF
          </label>
          <p className="mb-3 text-sm text-slate-600">
            Maximum size: 10 MB. The PDF must contain selectable text; scanned
            pages need OCR first.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={pdfInputRef}
              id="pdf-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                setPdfFile(event.target.files?.[0] ?? null);
                setPdfError("");
              }}
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium hover:file:bg-slate-200"
            />
            <button
              type="button"
              onClick={handlePdfUpload}
              disabled={uploadingPdf || loading}
              className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingPdf ? "Reading and generating..." : "Upload PDF"}
            </button>
          </div>

          {pdfFile && (
            <p className="mt-2 text-xs text-slate-500">
              Selected: {pdfFile.name}
            </p>
          )}

          {pdfError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {pdfError}
            </p>
          )}
        </form>

        {result && (
          <section className="mt-8 space-y-6">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                {result.title || "Summary"}
              </h2>
              <p className="mt-3 leading-7 text-slate-700">{result.summary}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Key points</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                {result.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Quiz</h2>
              <div className="mt-5 space-y-6">
                {result.quiz.map((item, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="border-t border-slate-100 pt-5 first:border-0 first:pt-0"
                  >
                    <h3 className="font-semibold">
                      {questionIndex + 1}. {item.question}
                    </h3>
                    <ol className="mt-3 space-y-2">
                      {item.options.map((option, optionIndex) => (
                        <li
                          key={optionIndex}
                          className={`rounded-lg px-3 py-2 text-sm ${
                            optionIndex === item.correctAnswerIndex
                              ? "bg-emerald-50 font-medium text-emerald-800"
                              : "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                          {optionIndex === item.correctAnswerIndex &&
                            " — Correct answer"}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
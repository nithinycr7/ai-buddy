import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/UI/Card";
import { cn } from "../../utils/cn";

type QuestionAnalysis = {
  id: string;
  extractedText: string;
  seenBefore: boolean;
  seenSources?: Array<{ subject: string; topic: string; whenISO: string }>;
  correctness: "correct" | "incorrect" | "partial" | "unknown";
  reason?: string;
  recommendation?: string;
};

type AnalysisResponse = {
  examMeta: {
    subject?: string;
    totalQuestions: number;
    attempted: number;
    correct: number;
    incorrect: number;
    partial: number;
    coverageMatched: number; // how many mapped to known syllabus/DB
  };
  questions: QuestionAnalysis[];
};

export default function ExamAnalysis() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePickClick = () => inputRef.current?.click();

  const onFiles = useCallback((f: FileList | null) => {
    if (!f || f.length === 0) return;
    const first = f[0];
    if (!first.type.startsWith("image/") && !first.type.includes("pdf")) {
      setError("Please upload an image (PNG/JPG) or a PDF.");
      return;
    }
    setError(null);
    setFile(first);
    const url = URL.createObjectURL(first);
    setPreviewURL(url);
    setAnalysis(null);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiles(e.target.files);
  };

  const disabled = useMemo(() => loading, [loading]);

  // TODO: replace fetch URL with your backend endpoint
  // Expected backend flow:
  // 1) Perform OCR on the image/PDF to extract questions.
  // 2) For each question, look up your DB: whether student studied/encountered it (via embeddings/metadata).
  // 3) Compare student’s chosen answer (if provided) vs answer key to set correctness & reason.
  // 4) Return structured AnalysisResponse (see types above).
  const runAnalysis = async () => {
    if (!file) {
      setError("Please upload an image or PDF first.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const fd = new FormData();
      fd.append("file", file);

      // Stubbed demo path — change to your API:
      // e.g. POST /api/exams/analyze-image
      const resp = await fetch("/api/exams/analyze-image", {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }

      const data = (await resp.json()) as AnalysisResponse;
      setAnalysis(data);
    } catch (e: any) {
      // Fallback demo: mock a response so UI is testable before backend is ready
      console.warn("Falling back to mock analysis:", e?.message);
      const mock: AnalysisResponse = {
        examMeta: {
          subject: "Science",
          totalQuestions: 5,
          attempted: 5,
          correct: 3,
          incorrect: 1,
          partial: 1,
          coverageMatched: 4,
        },
        questions: [
          {
            id: "Q1",
            extractedText:
              "1) Photosynthesis equation and identify the role of chlorophyll.",
            seenBefore: true,
            seenSources: [
              { subject: "Biology", topic: "Photosynthesis", whenISO: "2025-07-14" },
            ],
            correctness: "correct",
            reason: "Balanced equation and role stated correctly.",
            recommendation: "Great! Consider memorizing where light reactions occur.",
          },
          {
            id: "Q2",
            extractedText:
              "2) Label parts of a plant cell (chloroplast, mitochondria, nucleus).",
            seenBefore: true,
            seenSources: [
              { subject: "Biology", topic: "Cells & Tissues", whenISO: "2025-07-10" },
            ],
            correctness: "partial",
            reason: "Chloroplast and nucleus correct; mitochondria label misplaced.",
            recommendation: "Revisit organelle positions and functions.",
          },
          {
            id: "Q3",
            extractedText: "3) Define aerobic respiration.",
            seenBefore: false,
            correctness: "incorrect",
            reason: "Missed oxygen requirement and ATP yield.",
            recommendation: "Review: Aerobic uses O₂; higher ATP yield than anaerobic.",
          },
          {
            id: "Q4",
            extractedText: "4) Contrast diffusion vs osmosis with an example.",
            seenBefore: true,
            seenSources: [
              { subject: "Biology", topic: "Transport in Cells", whenISO: "2025-07-18" },
            ],
            correctness: "correct",
            reason: "Key differences and example were accurate.",
            recommendation: "Add a diagram next time for faster recall.",
          },
          {
            id: "Q5",
            extractedText: "5) Write the byproducts of anaerobic respiration in yeast.",
            seenBefore: false,
            correctness: "unknown",
            reason: "Answer unreadable; needed for correctness.",
            recommendation: "Ensure handwriting clarity or rewrite when unsure.",
          },
        ],
      };
      setAnalysis(mock);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Exam & Assessment Analysis</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      <Card title="Upload your exam/assessment image (or PDF)">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 grid place-items-center bg-white",
            "text-center"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={onChange}
          />
          {!file ? (
            <div className="space-y-2">
              <div className="text-sm text-slate-600">
                Drag & drop your scanned paper here, or
              </div>
              <button
                onClick={handlePickClick}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-soft hover:bg-indigo-500"
              >
                Browse file
              </button>
              <div className="text-xs text-slate-500">
                Supported: PNG, JPG, PDF
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  Selected: <span className="font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewURL(null);
                    setAnalysis(null);
                  }}
                  className="text-sm px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Remove
                </button>
              </div>
              {previewURL && file.type.startsWith("image/") && (
                <img
                  src={previewURL}
                  alt="Preview"
                  className="w-full max-h-[420px] object-contain rounded-xl border"
                />
              )}
              {file.type.includes("pdf") && (
                <div className="text-sm text-slate-600">
                  PDF selected. Preview not shown here.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={runAnalysis}
            disabled={disabled || !file}
            className={cn(
              "px-4 py-2 rounded-xl text-white shadow-soft",
              disabled || !file
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700"
            )}
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>

          <div className="text-xs text-slate-500">
            We’ll check whether you studied these questions earlier and explain
            why answers are right/wrong with targeted recommendations.
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </Card>

      {analysis && (
        <>
          <Card title="Summary">
            <div className="grid sm:grid-cols-5 gap-3 text-center">
              <Stat label="Subject" value={analysis.examMeta.subject ?? "—"} />
              <Stat label="Total" value={analysis.examMeta.totalQuestions} />
              <Stat label="Attempted" value={analysis.examMeta.attempted} />
              <Stat label="Correct" value={analysis.examMeta.correct} />
              <Stat label="Incorrect" value={analysis.examMeta.incorrect} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-3 text-center">
              <Stat label="Partial" value={analysis.examMeta.partial} />
              <Stat
                label="Matched with your study"
                value={`${analysis.examMeta.coverageMatched}/${analysis.examMeta.totalQuestions}`}
              />
              <Stat
                label="Accuracy"
                value={
                  analysis.examMeta.attempted > 0
                    ? `${Math.round(
                        (analysis.examMeta.correct / analysis.examMeta.attempted) * 100
                      )}%`
                    : "—"
                }
              />
            </div>
          </Card>

          <Card title="Per-question insights">
            <ul className="space-y-3">
              {analysis.questions.map((q) => (
                <li key={q.id} className="border rounded-2xl p-3 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">
                      {q.id}. {q.extractedText}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge
                        tone={
                          q.correctness === "correct"
                            ? "success"
                            : q.correctness === "incorrect"
                            ? "danger"
                            : q.correctness === "partial"
                            ? "warning"
                            : "slate"
                        }
                      >
                        {q.correctness.toUpperCase()}
                      </Badge>
                      <Badge tone={q.seenBefore ? "info" : "slate"}>
                        {q.seenBefore ? "Seen before" : "New question"}
                      </Badge>
                    </div>
                  </div>

                  {q.seenBefore && q.seenSources?.length ? (
                    <div className="mt-2 text-xs text-slate-600">
                      Studied from:{" "}
                      {q.seenSources
                        .map(
                          (s) =>
                            `${s.subject} → ${s.topic} (${new Date(
                              s.whenISO
                            ).toLocaleDateString("en-IN")})`
                        )
                        .join("; ")}
                    </div>
                  ) : null}

                  {q.reason && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Why:</span>{" "}
                      <span className="text-slate-700">{q.reason}</span>
                    </div>
                  )}
                  {q.recommendation && (
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Next step:</span>{" "}
                      <span className="text-slate-700">{q.recommendation}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "success" | "danger" | "warning" | "info" | "slate";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : tone === "danger"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : tone === "warning"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : tone === "info"
      ? "bg-indigo-100 text-indigo-800 border-indigo-200"
      : "bg-slate-100 text-slate-800 border-slate-200";
  return (
    <span className={cn("px-2 py-0.5 rounded-lg border text-[11px] font-medium", toneClass)}>
      {children}
    </span>
  );
}

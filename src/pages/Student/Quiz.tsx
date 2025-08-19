import { useAppStore } from "../../store/useAppStore";
import { useState } from "react";

const q = {
  text: "Which organelle is primarily responsible for photosynthesis?",
  options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
  answer: 1,
};

export default function Quiz() {
const { quiz, setQuizIndex, markCorrect } = useAppStore(s => ({
  quiz: (s as any).quiz,
  setQuizIndex: (s as any).setQuizIndex,
  markCorrect: (s as any).markCorrect,
}));
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  function submit() {
    if (selected === null) return;
    const ok = selected === q.answer;
    setResult(ok ? "correct" : "wrong");
    if (ok) markCorrect();
  }

  return (
    <div className="space-y-4 text-center">
      <div className=" text-2xl">
        Question {quiz.index} / {quiz.total}
      </div>
      <div className="text-xl font-semibold">{q.text}</div>
      <div className="space-y-2 max-w-md mx-auto">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full px-4 py-3 rounded-xl border shadow-soft ${
              selected === i ? "bg-pastelBlue" : "bg-white hover:bg-slate-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <button onClick={submit} className="px-4 py-2 rounded-xl bg-slate-800 text-white">
          Submit
        </button>
        <button
          onClick={() => setQuizIndex(Math.min(quiz.index + 1, quiz.total))}
          className="px-4 py-2 rounded-xl bg-white border"
        >
          Next
        </button>
        <button className="px-4 py-2 rounded-xl bg-white border">Review Mistakes</button>
      </div>
      {result === "correct" && (
        <div className="mt-2 text-green-700 font-bold">
          ✅ Correct! <span className="inline-block ml-2">[ink stamp animation]</span>
        </div>
      )}
      {result === "wrong" && (
        <div className="mt-2 text-red-700 font-bold">
          ❌ Try again <span className="inline-block ml-2">[scribble animation]</span>
        </div>
      )}
    </div>
  );
}

import { useAppStore } from "../../../store/useAppStore";
import { useRef, useState } from "react";

export default function Communication() {
  const { transcripts, addTurn, addCoachNudge, reset } = useAppStore(s => s.communication);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    addTurn({ role: "child", text: input.trim() });
    // simple heuristic nudge
    if (!/[.,!?]/.test(input)) {
      addCoachNudge("Great start! Can you extend that with a reason or example?");
    }
    setInput("");
    setTimeout(() => listRef.current?.scrollTo({ top: 1e6, behavior: "smooth" }), 50);
  };

  return (
    <div className="mx-auto max-w-[900px] p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl header-hand">Communication Skills</h1>
        <button className="px-3 py-1.5 rounded-lg border" onClick={reset}>
          Reset
        </button>
      </div>

      <div
        ref={listRef}
        className="mt-4 h-[55vh] overflow-auto rounded-2xl border bg-white p-3 space-y-2"
      >
        {transcripts.length === 0 && (
          <div className="text-sm text-slate-600">Start by saying something about your day 🙂</div>
        )}
        {transcripts.map(t => (
          <div
            key={t.id}
            className={`p-3 rounded-xl ${t.role === "child" ? "bg-emerald-50" : "bg-slate-50"} `}
          >
            <div className="text-xs text-slate-500 mb-1">
              {t.role === "child" ? "You" : "Coach"}
            </div>
            <div>{t.text}</div>
            {t.nudge && <div className="mt-1 text-xs text-amber-700">Nudge: {t.nudge}</div>}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Speak or type your response… (mock: type + Send)"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="px-4 py-2 rounded-xl bg-slate-800 text-white" onClick={send}>
          Send
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        (Hook up Web Speech API / your voice agent later; this mocks transcript + coaching nudges.)
      </p>
    </div>
  );
}

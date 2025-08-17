import { useState } from "react";
import { useAppStore } from "../../../store/useAppStore";

export default function Grievance() {
  const [text, setText] = useState("");
  const submit = useAppStore(s => s.grievances.submit);
  const list = useAppStore(s => s.grievances.all);

  const onSubmit = () => {
    if (!text.trim()) return;
    submit(text.trim());
    setText("");
    alert("Submitted. Teacher and parent notified (mock).");
  };

  return (
    <div className="mx-auto max-w-[900px] p-4 space-y-4">
      <h1 className="text-2xl ">Grievance Redressal</h1>
      <textarea
        className="w-full h-32 p-3 border rounded-2xl"
        placeholder="Share your concern…"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button className="px-4 py-2 rounded-xl bg-slate-800 text-white" onClick={onSubmit}>
        Submit Grievance
      </button>

      <div className="pt-4">
        <h2 className="text-lg mb-2">Your previous submissions</h2>
        <div className="space-y-2">
          {list.length === 0 && <div className="text-sm text-slate-600">No grievances yet.</div>}
          {list.map(g => (
            <div key={g.id} className="border rounded-2xl p-3 bg-white">
              <div className="text-xs text-slate-500">
                {new Date(g.createdAt).toLocaleString()}
                {" · "}Status: {g.status}
              </div>
              <div className="mt-1">{g.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

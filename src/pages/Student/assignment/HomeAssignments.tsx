import { useState } from "react";
import { useAppStore } from "../../../store/useAppStore";

export default function HomeAssignments() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayISO);
  const getAssignmentsFor = useAppStore(s => s.getAssignmentsFor);
  const toggleAssignment = useAppStore(s => s.toggleAssignment);

  const list = getAssignmentsFor(date);

  return (
    <div className="mx-auto max-w-[900px] p-4 space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl header-hand">Home Assignments</h1>
        <div className="text-sm">
          <label className="mr-2 text-slate-600">Pick a date</label>
          <input
            type="date"
            className="border rounded-xl px-3 py-1.5 bg-white"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="text-sm text-slate-600 border rounded-2xl p-3 bg-white">
            No assignments for <span className="font-medium">{date}</span>.
          </div>
        )}

        {list.map(a => (
          <div
            key={a.id}
            className="border rounded-2xl p-3 bg-white flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-slate-500">
                {a.subject} · {a.type.toUpperCase()} · {a.numQuestions} questions
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <label className="text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={a.completed}
                  onChange={e => toggleAssignment(a.id, e.target.checked)}
                />
                Done
              </label>
              <a
                href={`/student/quiz?id=${a.id}`}
                className="px-3 py-1.5 rounded-lg bg-pastelYellow border shadow-soft text-sm"
              >
                Open
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useAppStore } from "../../../store/useAppStore";

export default function Hobby() {
  const { selected, plans, select, markDone } = useAppStore(s => s.hobby);
  const options = Object.keys(plans);

  const active = selected ? plans[selected] : null;

  return (
    <div className="mx-auto max-w-[1000px] p-4 space-y-4">
      <h1 className="text-2xl header-hand">Hobby Development</h1>

      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o}
            className={`px-3 py-1.5 rounded-xl border ${
              selected === o ? "bg-indigo-600 text-white" : "bg-white"
            }`}
            onClick={() => select(o)}
          >
            {o}
          </button>
        ))}
      </div>

      {!active && (
        <div className="text-sm text-slate-600">Select a hobby to view your 30‑day plan.</div>
      )}

      {active && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {active.map(day => (
            <div
              key={day.day}
              className={`rounded-2xl border p-3 ${
                day.unlocked ? "bg-white" : "bg-slate-50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">Day {day.day}</div>
                <div className="text-xs">
                  {day.unlocked ? (day.done ? "✅ Done" : "🔓 Unlocked") : "🔒 Locked"}
                </div>
              </div>
              <div className="mt-2 text-sm space-y-1">
                <div className="text-slate-700">{day.title}</div>
                <ul className="list-disc pl-4 text-slate-600">
                  {day.tasks.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <button
                disabled={!day.unlocked || day.done}
                className="mt-3 w-full px-3 py-2 rounded-xl border bg-emerald-50 disabled:opacity-50"
                onClick={() => markDone(selected!, day.day)}
              >
                Mark Day Complete
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">Next day unlocks only when today is completed.</p>
    </div>
  );
}
